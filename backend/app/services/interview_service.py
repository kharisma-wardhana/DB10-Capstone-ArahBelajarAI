"""Mock interview service using LangChain + OpenAI with SSE streaming."""

import json
import uuid
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

SYSTEM_PROMPT = """Kamu adalah seorang interviewer profesional untuk posisi {job_role}.
Kamu sedang melakukan mock interview untuk membantu kandidat mempersiapkan diri.
Kandidat memiliki skill berikut: {user_skills}.
Bahasa: Jawab dalam {language}.

Aturan:
- Ajukan tepat 5 pertanyaan wawancara, satu per satu.
- Campurkan pertanyaan behavioral, teknis, dan situasional yang relevan dengan posisi.
- Setelah kandidat menjawab, berikan tanggapan singkat lalu ajukan pertanyaan berikutnya.
- Setelah semua 5 pertanyaan selesai, tulis "INTERVIEW_COMPLETE" dan berikan penilaian singkat.
- Bersikaplah mendukung namun jujur. Berikan feedback yang konstruktif.
- Lacak nomor pertanyaan (1-5). Cantumkan nomor pertanyaan di awal setiap pertanyaan baru.
"""

FEEDBACK_PROMPT = """Based on this mock interview conversation for the role of {job_role},
provide structured feedback as JSON. Respond ONLY with valid JSON, no other text.

{{
  "overall_score": <float 0-100>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "question_summaries": [
    {{"question": "...", "answer_quality": "good/average/needs_improvement", "tip": "..."}}
  ]
}}

Conversation:
{conversation}"""


@dataclass
class InterviewSession:
    session_id: str
    job_role: str
    language: str
    user_skills: list[str]
    message_history: ChatMessageHistory = field(default_factory=ChatMessageHistory)
    question_count: int = 0
    is_complete: bool = False


class InterviewService:
    def __init__(
        self,
        api_key: str,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
    ):
        self._api_key = api_key
        self._model_name = model_name
        self._temperature = temperature
        self._sessions: dict[str, InterviewSession] = {}

    def _get_language_label(self, code: str) -> str:
        return "Bahasa Indonesia" if code == "id" else "English"

    def _build_chain(self, session: InterviewSession):
        llm = ChatOpenAI(
            api_key=self._api_key,
            model=self._model_name,
            temperature=self._temperature,
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT.format(
                job_role=session.job_role,
                user_skills=", ".join(session.user_skills) or "tidak disebutkan",
                language=session.language,
            )),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])
        chain = prompt | llm
        return RunnableWithMessageHistory(
            chain,
            lambda _sid: session.message_history,
            input_messages_key="input",
            history_messages_key="history",
        )

    def start_session(
        self,
        job_role: str,
        user_skills: list[str],
        language: str = "id",
    ) -> tuple[str, str]:
        """Start a new interview. Returns (session_id, first_question)."""
        session_id = str(uuid.uuid4())
        session = InterviewSession(
            session_id=session_id,
            job_role=job_role,
            language=self._get_language_label(language),
            user_skills=user_skills,
        )
        self._sessions[session_id] = session

        chain = self._build_chain(session)
        response = chain.invoke(
            {"input": "Mulai interview dengan pertanyaan 1."},
            config={"configurable": {"session_id": session_id}},
        )
        session.question_count = 1
        return session_id, response.content

    async def chat_stream(
        self,
        session_id: str,
        user_message: str,
    ) -> AsyncGenerator[str, None]:
        """Stream interview response as SSE events."""
        session = self._get_session(session_id)
        chain = self._build_chain(session)

        full_content = ""
        async for chunk in chain.astream(
            {"input": user_message},
            config={"configurable": {"session_id": session_id}},
        ):
            token = chunk.content
            if token:
                full_content += token
                data = json.dumps({"token": token}, ensure_ascii=False)
                yield f"data: {data}\n\n"

        # Check completion
        if "INTERVIEW_COMPLETE" in full_content:
            session.is_complete = True
        else:
            session.question_count += 1

        # Send final metadata event
        done_data = json.dumps({
            "done": True,
            "question_number": min(session.question_count, 5),
            "total_questions": 5,
            "is_complete": session.is_complete,
        })
        yield f"data: {done_data}\n\n"

    def get_session_info(self, session_id: str) -> InterviewSession:
        return self._get_session(session_id)

    def get_feedback(self, session_id: str) -> dict:
        """Generate structured feedback for a completed interview."""
        session = self._get_session(session_id)

        if not session.is_complete:
            # Force completion via sync call
            chain = self._build_chain(session)
            chain.invoke(
                {"input": "Akhiri interview dan berikan feedback akhir."},
                config={"configurable": {"session_id": session_id}},
            )
            session.is_complete = True

        # Generate structured feedback
        llm = ChatOpenAI(
            api_key=self._api_key,
            model=self._model_name,
            temperature=0.3,
        )
        conversation_text = "\n".join(
            f"{m.type}: {m.content}" for m in session.message_history.messages
        )
        prompt = FEEDBACK_PROMPT.format(
            job_role=session.job_role,
            conversation=conversation_text,
        )
        result = llm.invoke(prompt)

        try:
            return json.loads(result.content)
        except json.JSONDecodeError:
            return {
                "overall_score": 0,
                "strengths": [],
                "improvements": ["Unable to parse feedback"],
                "question_summaries": [],
            }

    def _get_session(self, session_id: str) -> InterviewSession:
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(session_id)
        return session
