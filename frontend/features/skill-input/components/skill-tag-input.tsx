"use client";

import { useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SkillTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function SkillTagInput({ tags, onTagsChange }: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addTag(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setInputValue("");
  }

  function removeTag(tag: string) {
    onTagsChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ketik skill lalu tekan Enter (contoh: python, sql, react)"
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 gap-1"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <p className="text-white/40 text-xs">
        Tekan Enter atau koma untuk menambah skill. {tags.length} skill ditambahkan.
      </p>
    </div>
  );
}
