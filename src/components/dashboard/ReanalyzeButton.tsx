"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

export default function ReanalyzeButton({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReanalyze = async () => {
    setLoading(true);
    try {
      await fetch(`/api/analyze/${resumeId}`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" loading={loading} onClick={handleReanalyze}>
      <RefreshCw className="h-4 w-4" />
      Повторний аналіз
    </Button>
  );
}
