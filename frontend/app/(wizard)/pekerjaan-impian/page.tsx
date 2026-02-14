"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { TopJobsGrid } from "@/features/job-selection/components/top-jobs-grid";
import { JobCombobox } from "@/features/job-selection/components/job-combobox";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { motion } from "framer-motion";

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
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-brand-text text-2xl font-bold mb-1">
            Pekerjaan Impian
          </h2>
          <p className="text-brand-text-muted text-sm">
            Pilih pekerjaan yang ingin kamu capai
          </p>
        </div>

        {/* Popular Jobs */}
        <div>
          <h3 className="text-brand-text/80 text-sm font-medium mb-3">
            Pilihan Populer di Indonesia 2025
          </h3>
          <TopJobsGrid
            selectedJob={selectedJobTitle}
            onSelect={setSelectedJobTitle}
          />
        </div>

        {/* Search */}
        <div>
          <h3 className="text-brand-text/80 text-sm font-medium mb-3">
            Atau cari pekerjaan lain
          </h3>
          <JobCombobox
            selectedJob={selectedJobTitle}
            onSelect={setSelectedJobTitle}
          />
        </div>

        {selectedJobTitle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-brand-card border border-brand-secondary/30 rounded-xl p-3 text-center"
          >
            <span className="text-brand-text-muted text-sm">Dipilih: </span>
            <span className="text-brand-text font-semibold text-sm">
              {selectedJobTitle}
            </span>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/gaya-belajar")}
            className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
          >
            Kembali
          </Button>
          <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleContinue}
              disabled={!selectedJobTitle}
              className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold disabled:opacity-30 cursor-pointer"
            >
              Lanjut
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
