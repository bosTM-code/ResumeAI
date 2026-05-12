export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBytes } from "@/lib/utils";
import { FileText, Upload, TrendingUp, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [resumes, totalResumes, analyzedCount, avgResult] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id },
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.resume.count({ where: { userId: session.user.id } }),
    prisma.resumeAnalysis.count({
      where: { resume: { userId: session.user.id }, status: "COMPLETED" },
    }),
    prisma.resumeAnalysis.aggregate({
      where: { resume: { userId: session.user.id }, status: "COMPLETED" },
      _avg: { overallScore: true },
    }),
  ]);

  const avgScore = Math.round(avgResult._avg.overallScore ?? 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Вітаємо, {session.user.name?.split(" ")[0] ?? ""}!
          </h1>
          <p className="text-gray-500 mt-1">Ваш особистий кабінет</p>
        </div>
        <Link href="/upload">
          <Button>
            <Upload className="h-4 w-4" />
            Завантажити резюме
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalResumes}</p>
            <p className="text-sm text-gray-500">Резюме завантажено</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyzedCount}</p>
            <p className="text-sm text-gray-500">Проаналізовано</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
            <p className="text-sm text-gray-500">Середній бал</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Останні резюме</h2>
          <Link href="/dashboard/resumes" className="text-sm text-indigo-600 hover:underline">
            Всі резюме
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Ви ще не завантажили жодного резюме</p>
            <Link href="/upload" className="mt-4 inline-block">
              <Button size="sm">Завантажити перше резюме</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {resumes.map((resume) => (
              <div key={resume.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resume.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(resume.fileSize)} · {formatDate(resume.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                      ? `${resume.analysis.overallScore}%`
                      : resume.analysis?.status === "FAILED"
                      ? "Помилка"
                      : "Обробка..."}
                  </Badge>
                  <Link href={`/dashboard/resumes/${resume.id}`}>
                    <Button variant="outline" size="sm">Переглянути</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
