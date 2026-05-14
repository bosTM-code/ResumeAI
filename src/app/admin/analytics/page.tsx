export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import AdminResumeChart from "@/components/admin/AdminResumeChart";
import AdminFileTypeChart from "@/components/admin/AdminFileTypeChart";
import AdminScoreChart from "@/components/admin/AdminScoreChart";

export default async function AdminAnalyticsPage() {
  const [resumes, analyses] = await Promise.all([
    prisma.resume.findMany({
      select: { createdAt: true, fileType: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.resumeAnalysis.findMany({
      where: { status: "COMPLETED", overallScore: { not: null } },
      select: { createdAt: true, overallScore: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const resumeData = resumes.map((r) => ({
    date: r.createdAt.toISOString().split("T")[0],
    fileType: r.fileType,
  }));

  const scoreData = analyses.map((a) => ({
    date: a.createdAt.toISOString().split("T")[0],
    score: a.overallScore as number,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Аналітика</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Завантаження резюме</h2>
          <AdminResumeChart data={resumeData} />
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Типи файлів</h2>
          <AdminFileTypeChart data={resumeData} />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Середній бал резюме</h2>
          <AdminScoreChart data={scoreData} />
        </Card>
      </div>
    </div>
  );
}
