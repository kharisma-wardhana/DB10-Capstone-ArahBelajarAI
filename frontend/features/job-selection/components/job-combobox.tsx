"use client";

import { useState, useEffect } from "react";
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

export function JobCombobox({ selectedJob, onSelect }: JobComboboxProps) {
  const [allJobs, setAllJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
      <Command className="bg-transparent">
        <CommandInput
          placeholder={loading ? "Memuat daftar pekerjaan..." : "Cari pekerjaan lain..."}
          className="text-white placeholder:text-white/40"
        />
        <CommandList className="max-h-48">
          <CommandEmpty className="text-white/50 text-sm py-4 text-center">
            Pekerjaan tidak ditemukan
          </CommandEmpty>
          <CommandGroup>
            {allJobs.map((job) => (
              <CommandItem
                key={job}
                value={job}
                onSelect={() => onSelect(job)}
                className={`cursor-pointer text-white/80 ${
                  selectedJob === job ? "bg-white/20 text-white" : ""
                }`}
              >
                {job}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
