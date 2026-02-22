"""Multi-mode AI Career Mentor service using LangChain + OpenAI with SSE streaming.

Supports three modes:
- interview: Mock interview with 5 questions (original)
- career_advice: Personalized career transition advice using full wizard context
- learning_coach: Weekly learning plan generation based on skill gaps
"""

import json
import uuid
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from typing import Optional

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

# ---------- Mode Constants ----------
MODE_INTERVIEW = "interview"
MODE_CAREER_ADVICE = "career_advice"
MODE_LEARNING_COACH = "learning_coach"

VALID_MODES = {MODE_INTERVIEW, MODE_CAREER_ADVICE, MODE_LEARNING_COACH}

# ---------- System Prompts ----------

INTERVIEW_SYSTEM_PROMPT = """Kamu adalah seorang interviewer profesional untuk posisi {job_role}.
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

CAREER_ADVICE_SYSTEM_PROMPT = """Kamu adalah seorang AI Career Mentor bernama "MentorAI" yang sangat berpengalaman.
Kamu memiliki akses lengkap ke profil karir pengguna berikut:

=== PROFIL PENGGUNA ===
Posisi Target: {job_role}
Gaya Belajar (VAK): {vak_style}
Skill yang Dimiliki: {user_skills}
Skor Kesiapan: {readiness_score}%

Skill yang Sudah Cocok: {matched_skills}
Skill yang Perlu Dipelajari: {missing_skills}

Breakdown per Kategori:
{category_breakdown}

Trend Demand Skill (SkillPulse):
{skill_trends}
=== END PROFIL ===

Bahasa: Jawab dalam {language}.

Aturan:
- Berikan saran karir yang SANGAT SPESIFIK berdasarkan data profil di atas. Jangan generik.
- Referensikan skill spesifik yang dimiliki dan yang kurang, serta skor kesiapan mereka.
- Prioritaskan saran berdasarkan skill yang sedang "Rising" (tren naik) di pasar kerja.
- Berikan insight tentang bagaimana gaya belajar {vak_style} mereka bisa dimanfaatkan.
- Berikan saran yang actionable dan konkret, bukan teori.
- Kamu boleh bertanya balik untuk memperdalam pemahaman tentang goals user.
- Bersikap supportif, hangat, tapi jujur.
- Gunakan data yang ada, jangan mengada-ada statistik.
"""

LEARNING_COACH_SYSTEM_PROMPT = """Kamu adalah AI Learning Coach bernama "MentorAI" yang ahli menyusun rencana belajar.
Kamu memiliki akses lengkap ke profil dan kebutuhan belajar pengguna:

=== PROFIL PENGGUNA ===
Posisi Target: {job_role}
Gaya Belajar (VAK): {vak_style}
Skor Kesiapan: {readiness_score}%

Skill yang Sudah Dimiliki: {user_skills}
Skill yang Perlu Dipelajari (urutan prioritas):
{missing_skills_with_priority}

Breakdown Kategori:
{category_breakdown}
=== END PROFIL ===

Bahasa: Jawab dalam {language}.

Aturan:
- Buatkan rencana belajar mingguan yang detail dan actionable.
- Sesuaikan format dan metode belajar dengan gaya belajar {vak_style}:
  * Visual: sarankan video tutorial, diagram, mind map, infografis.
  * Auditory: sarankan podcast, audiobook, diskusi, explain-to-others.
  * Kinesthetic: sarankan project-based learning, hands-on coding, build portfolio.
- Prioritaskan skill berdasarkan importance rank dan trend demand.
- Berikan estimasi waktu realistis per skill (jam per minggu).
- Sertakan milestone dan cara mengukur progress.
- Jika user bertanya lanjutan, adaptasi rencana berdasarkan feedback mereka.
- Bersikap seperti mentor yang supportif dan memotivasi.
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


_NOT_AVAILABLE = "tidak tersedia"
_NO_SKILLS = "tidak disebutkan"

_VAK_LABELS = {"visual": "Visual", "auditory": "Auditori", "kinesthetic": "Kinestetik"}
_TREND_LABELS = {"hot": "Rising", "stable": "Stable", "declining": "Declining"}


def _format_vak(vak: Optional[dict]) -> str:
    if not vak:
        return "tidak diketahui"
    dominant = vak.get("dominant", "")
    scores = vak.get("scores", {})
    style = _VAK_LABELS.get(dominant, dominant)
    if scores:
        style += f" (V:{scores.get('visual', 0)} A:{scores.get('auditory', 0)} K:{scores.get('kinesthetic', 0)})"
    return style


def _format_missing_skills(missing: list[dict]) -> tuple[str, str]:
    if not missing:
        return "tidak ada gap teridentifikasi", "tidak ada gap teridentifikasi"
    names = ", ".join(m.get("skill_name", "") for m in missing[:15])
    with_priority = "\n".join(
        f"  {i+1}. {m.get('skill_name', '')} "
        f"(kategori: {m.get('category', '')}, frekuensi: {round(m.get('frequency', 0) * 100)}%"
        f"{', prioritas: ' + str(round(m.get('priority_score', 0), 2)) if m.get('priority_score') else ''})"
        for i, m in enumerate(missing[:15])
    )
    return names, with_priority


def _format_categories(categories: dict) -> str:
    if not categories:
        return _NOT_AVAILABLE
    lines = []
    for key, cat in categories.items():
        label = key.replace("_", " ").title()
        coverage = round(cat.get("coverage_pct", 0) * 100)
        total = cat.get("total_required", 0)
        has = cat.get("user_has", 0)
        cat_missing = cat.get("missing", [])
        line = f"  - {label}: {has}/{total} ({coverage}%)"
        if cat_missing:
            line += f" | Kurang: {', '.join(cat_missing[:5])}"
        lines.append(line)
    return "\n".join(lines)


def _format_trends(missing: list[dict]) -> str:
    lines = []
    for m in missing[:10]:
        trend = m.get("demand_trend")
        if not trend:
            continue
        trend_label = _TREND_LABELS.get(trend.get("predicted_trend", ""), "Unknown")
        growth = round(trend.get("growth_rate", 0) * 100, 1)
        demand = trend.get("current_demand", 0)
        lines.append(
            f"  - {m.get('skill_name', '')}: {trend_label} "
            f"(growth: {growth}%, demand: {demand} jobs)"
        )
    return "\n".join(lines) if lines else "data trend " + _NOT_AVAILABLE


def build_mentor_context(wizard_context: Optional[dict]) -> dict:
    """Build structured context strings from the full wizard state."""
    if not wizard_context:
        return {
            "vak_style": "tidak diketahui",
            "readiness_score": "N/A",
            "matched_skills": _NOT_AVAILABLE,
            "missing_skills": _NOT_AVAILABLE,
            "missing_skills_with_priority": _NOT_AVAILABLE,
            "category_breakdown": _NOT_AVAILABLE,
            "skill_trends": _NOT_AVAILABLE,
        }

    gap = wizard_context.get("gap_result", {})
    readiness = gap.get("overall_readiness_score", 0)
    matched = gap.get("matched_skills", [])
    missing = gap.get("missing_skills", [])
    missing_str, missing_priority = _format_missing_skills(missing)

    return {
        "vak_style": _format_vak(wizard_context.get("vak_result")),
        "readiness_score": str(round(readiness * 100)) if readiness else "N/A",
        "matched_skills": ", ".join(m.get("required_skill", "") for m in matched) if matched else "tidak ada",
        "missing_skills": missing_str,
        "missing_skills_with_priority": missing_priority,
        "category_breakdown": _format_categories(gap.get("category_breakdown", {})),
        "skill_trends": _format_trends(missing),
    }


@dataclass
class InterviewSession:
    session_id: str
    job_role: str
    language: str
    user_skills: list[str]
    mode: str = MODE_INTERVIEW
    wizard_context: Optional[dict] = None
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

    def _build_system_prompt(self, session: InterviewSession) -> str:
        """Build mode-specific system prompt with full context."""
        ctx = build_mentor_context(session.wizard_context)

        if session.mode == MODE_CAREER_ADVICE:
            return CAREER_ADVICE_SYSTEM_PROMPT.format(
                job_role=session.job_role,
                vak_style=ctx["vak_style"],
                user_skills=", ".join(session.user_skills) or _NO_SKILLS,
                readiness_score=ctx["readiness_score"],
                matched_skills=ctx["matched_skills"],
                missing_skills=ctx["missing_skills"],
                category_breakdown=ctx["category_breakdown"],
                skill_trends=ctx["skill_trends"],
                language=session.language,
            )
        elif session.mode == MODE_LEARNING_COACH:
            return LEARNING_COACH_SYSTEM_PROMPT.format(
                job_role=session.job_role,
                vak_style=ctx["vak_style"],
                user_skills=", ".join(session.user_skills) or _NO_SKILLS,
                readiness_score=ctx["readiness_score"],
                missing_skills_with_priority=ctx["missing_skills_with_priority"],
                category_breakdown=ctx["category_breakdown"],
                language=session.language,
            )
        else:
            # Default: interview mode
            return INTERVIEW_SYSTEM_PROMPT.format(
                job_role=session.job_role,
                user_skills=", ".join(session.user_skills) or _NO_SKILLS,
                language=session.language,
            )

    def _build_chain(self, session: InterviewSession):
        llm = ChatOpenAI(
            api_key=self._api_key,
            model=self._model_name,
            temperature=self._temperature,
        )
        system_prompt = self._build_system_prompt(session)
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
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

    def _get_initial_message(self, mode: str) -> str:
        """Get the initial trigger message based on mode."""
        if mode == MODE_CAREER_ADVICE:
            return (
                "Halo MentorAI! Saya ingin konsultasi tentang karir saya. "
                "Berdasarkan profil saya, apa saran utama kamu untuk transisi karir saya?"
            )
        elif mode == MODE_LEARNING_COACH:
            return (
                "Halo MentorAI! Tolong buatkan rencana belajar mingguan untuk 4 minggu ke depan "
                "berdasarkan skill gap dan gaya belajar saya."
            )
        else:
            return "Mulai interview dengan pertanyaan 1."

    def start_session(
        self,
        job_role: str,
        user_skills: list[str],
        language: str = "id",
        mode: str = MODE_INTERVIEW,
        wizard_context: Optional[dict] = None,
    ) -> tuple[str, str]:
        """Start a new session. Returns (session_id, first_response)."""
        if mode not in VALID_MODES:
            mode = MODE_INTERVIEW

        session_id = str(uuid.uuid4())
        session = InterviewSession(
            session_id=session_id,
            job_role=job_role,
            language=self._get_language_label(language),
            user_skills=user_skills,
            mode=mode,
            wizard_context=wizard_context,
        )
        self._sessions[session_id] = session

        chain = self._build_chain(session)
        initial_msg = self._get_initial_message(mode)
        response = chain.invoke(
            {"input": initial_msg},
            config={"configurable": {"session_id": session_id}},
        )

        if mode == MODE_INTERVIEW:
            session.question_count = 1

        return session_id, response.content

    async def chat_stream(
        self,
        session_id: str,
        user_message: str,
    ) -> AsyncGenerator[str, None]:
        """Stream response as SSE events."""
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

        # Mode-specific completion logic
        if session.mode == MODE_INTERVIEW:
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
            "mode": session.mode,
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
