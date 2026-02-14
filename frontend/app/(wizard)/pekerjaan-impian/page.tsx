"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { TopJobsGrid } from "@/features/job-selection/components/top-jobs-grid";
import { JobCombobox } from "@/features/job-selection/components/job-combobox";

export default function PekerjaanImpianPage() {
  const router = useRouter();
  const { selectedJobTitle, setSelectedJobTitle, completeStep } =
    useWizardStore();

  function handleContinue() {
    if (!selectedJobTitle) return;
    completeStep(2);
    router.push("/input-skill");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold mb-1">
          Pekerjaan Impian
        </h2>
        <p className="text-white/60 text-sm">
          Pilih pekerjaan yang ingin kamu capai
        </p>
      </div>

      {/* Popular Jobs */}
      <div>
        <h3 className="text-white/80 text-sm font-medium mb-3">
          Pilihan Populer di Indonesia 2025
        </h3>
        <TopJobsGrid
          selectedJob={selectedJobTitle}
          onSelect={setSelectedJobTitle}
        />
      </div>

      {/* Search */}
      <div>
        <h3 className="text-white/80 text-sm font-medium mb-3">
          Atau cari pekerjaan lain
        </h3>
        <JobCombobox
          selectedJob={selectedJobTitle}
          onSelect={setSelectedJobTitle}
        />
      </div>

      {selectedJobTitle && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-3 text-center">
          <span className="text-white/60 text-sm">Dipilih: </span>
          <span className="text-white font-semibold text-sm">
            {selectedJobTitle}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/gaya-belajar")}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
        >
          Kembali
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedJobTitle}
          className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold disabled:opacity-30 cursor-pointer"
        >
          Lanjut
        </Button>
      </div>
    </div>
  );
}
