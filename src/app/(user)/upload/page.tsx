"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);

  const validateFile = (f: File): string => {
    if (!ALLOWED_TYPES.includes(f.type)) return "Підтримуються лише PDF, DOC, DOCX";
    if (f.size > MAX_SIZE) return "Файл не має перевищувати 10 МБ";
    return "";
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Помилка завантаження (${res.status})`);
        return;
      }

      const { resumeId } = await res.json();
      setDone(true);
      setTimeout(() => router.push(`/dashboard/resumes/${resumeId}`), 1500);
    } catch {
      setError("Помилка завантаження. Спробуйте ще раз.");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center py-16">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Завантажено!</h2>
          <p className="text-gray-500">Перенаправляємо на результати аналізу...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Завантажити резюме</h1>
        <p className="text-gray-500 mt-1">Підтримуються PDF, DOC та DOCX файли до 10 МБ</p>
      </div>

      <Card>
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            Перетягніть файл сюди або{" "}
            <span className="text-indigo-600">оберіть файл</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX — до 10 МБ</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {file && (
          <div className="mt-4 flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <Button
          className="w-full mt-6"
          disabled={!file}
          loading={uploading}
          onClick={handleUpload}
        >
          {uploading ? "Завантаження та аналіз..." : "Завантажити та проаналізувати"}
        </Button>
      </Card>
    </div>
  );
}
