"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
}

export default function AdminBlogForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("excerpt", excerpt);
    formData.append("categoryId", categoryId);
    if (image) formData.append("image", image);

    const res = await fetch("/api/blog", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Помилка");
      return;
    }

    setTitle("");
    setContent("");
    setExcerpt("");
    setImage(null);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
      )}
      <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Короткий опис</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Контент</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Зображення</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-600"
        />
      </div>
      <Button type="submit" loading={loading}>Опублікувати</Button>
    </form>
  );
}
