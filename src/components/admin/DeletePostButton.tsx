"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!confirm("Видалити статтю?")) return;
    setLoading(true);
    await fetch(`/api/blog/${postId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <Button size="sm" variant="danger" loading={loading} onClick={handle}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
