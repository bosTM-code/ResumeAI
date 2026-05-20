"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export default function DeleteResumeButton({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Видалити це резюме? Цю дію не можна скасувати.")) return;
    setLoading(true);
    try {
      await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
