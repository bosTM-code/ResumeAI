"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function MarkReadButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await fetch(`/api/admin/messages/${messageId}`, { method: "PATCH" });
    router.refresh();
    setLoading(false);
  };

  return (
    <Button size="sm" variant="outline" loading={loading} onClick={handle}>
      Позначити прочитаним
    </Button>
  );
}
