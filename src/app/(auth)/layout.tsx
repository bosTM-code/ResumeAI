import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl mb-8">
        <FileText className="h-6 w-6" />
        ResumeAI
      </Link>
      {children}
    </div>
  );
}
