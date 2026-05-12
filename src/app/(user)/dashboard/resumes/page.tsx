export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBytes } from "@/lib/utils";
import { FileText, Upload } from "lucide-react";

export default async function ResumesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    include: { analysis: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Мої резюме</h1>
        <Link href="/upload">
          <Button><Upload className="h-4 w-4" />Завантажити</Button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Ви ще не завантажили жодного резюме</p>
          <Link href="/upload">
            <Button>Завантажити перше резюме</Button>
          </Link>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Файл</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Розмір</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Бал</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resumes.map((resume) => (
                <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{resume.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(resume.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatBytes(resume.fileSize)}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {resume.analysis?.overallScore != null ? `${resume.analysis.overallScore}%` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        resume.analysis?.status === "COMPLETED"
                          ? "success"
                          : resume.analysis?.status === "FAILED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {resume.analysis?.status === "COMPLETED"
                        ? "Виконано"
                        : resume.analysis?.status === "FAILED"
                        ? "Помилка"
                        : "Обробка..."}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/resumes/${resume.id}`}>
                      <Button variant="outline" size="sm">Деталі</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
