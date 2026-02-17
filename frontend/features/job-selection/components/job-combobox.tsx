"use client";

import { useState, useEffect, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { JobTitleListResponse } from "@/shared/api/types";
import { TOP_JOBS_INDONESIA_2025 } from "../data/top-jobs-id-2025";

interface JobComboboxProps {
  selectedJob: string | null;
  onSelect: (title: string) => void;
}

export function JobCombobox({ selectedJob, onSelect }: Readonly<JobComboboxProps>) {
  const [allJobs, setAllJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(true);
    apiRequest<JobTitleListResponse>(API.JOBS_TITLES)
      .then((data) => {
        const staticTitles = TOP_JOBS_INDONESIA_2025.map((j) => j.title);
        const merged = [
          ...new Set([...staticTitles, ...data.job_titles]),
        ];
        setAllJobs(merged);
      })
      .catch(() => {
        setAllJobs(TOP_JOBS_INDONESIA_2025.map((j) => j.title));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div ref={containerRef} className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-xl overflow-hidden">
      <Command className="bg-transparent">
        <CommandInput
          placeholder={loading ? "Memuat daftar pekerjaan..." : "Cari pekerjaan lain..."}
          className="text-brand-text placeholder:text-brand-text-muted"
          onFocus={() => setOpen(true)}
        />
        {open && (
          <CommandList className="max-h-48">
            <CommandEmpty className="text-brand-text-muted text-sm py-4 text-center">
              Pekerjaan tidak ditemukan
            </CommandEmpty>
            <CommandGroup>
              {allJobs.map((job) => (
                <CommandItem
                  key={job}
                  value={job}
                  onSelect={() => {
                    onSelect(job);
                    setOpen(false);
                  }}
                  className={`cursor-pointer text-brand-text/80 ${
                    selectedJob === job ? "bg-brand-card-hover text-brand-text" : ""
                  }`}
                >
                  {job}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
