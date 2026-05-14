"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function TogglePublishButton({
  postId,
  published,
}: {
  postId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await fetch(`/api/blog/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <Button
      size="sm"
      variant={published ? "outline" : "primary"}
      loading={loading}
      onClick={handle}
    >
      {published ? "Зняти" : "Опублікувати"}
    </Button>
  );
}
