export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Users, FileText, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import AdminResumeChart from "@/components/admin/AdminResumeChart";
import AdminFileTypeChart from "@/components/admin/AdminFileTypeChart";

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
};

export default async function AdminDashboardPage() {
  const [
    userCount,
    resumeCount,
    completedCount,
    failedCount,
    unreadMessages,
    recentResumes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resume.count(),
    prisma.resumeAnalysis.count({ where: { status: "COMPLETED" } }),
    prisma.resumeAnalysis.count({ where: { status: "FAILED" } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.resume.findMany({
      select: { createdAt: true, fileType: true },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
  ]);

  const stats = [
    { label: "Користувачів", value: userCount, icon: Users, color: "indigo" },
    { label: "Резюме", value: resumeCount, icon: FileText, color: "blue" },
    { label: "Успішних аналізів", value: completedCount, icon: CheckCircle, color: "green" },
    { label: "Помилок аналізу", value: failedCount, icon: XCircle, color: "red" },
    { label: "Нових повідомлень", value: unreadMessages, icon: MessageSquare, color: "yellow" },
  ];

  const chartData = recentResumes.map((r) => ({
    date: r.createdAt.toISOString().split("T")[0],
    fileType: r.fileType,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Завантаження резюме (100 останніх)</h2>
          <AdminResumeChart data={chartData} />
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Типи файлів</h2>
          <AdminFileTypeChart data={chartData} />
        </Card>
      </div>
    </div>
  );
}
