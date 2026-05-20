export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBytes } from "@/lib/utils";

export default async function AdminResumesPage() {
  const resumes = await prisma.resume.findMany({
    include: {
      analysis: { select: { status: true, overallScore: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Резюме</h1>
      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Файл</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Користувач</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Розмір</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Бал</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resumes.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-48 truncate">{r.fileName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{r.user.name ?? r.user.email}</td>
                <td className="px-6 py-4"><Badge>{r.fileType.toUpperCase()}</Badge></td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatBytes(r.fileSize)}</td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {r.analysis?.overallScore != null ? `${r.analysis.overallScore}%` : "—"}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      r.analysis?.status === "COMPLETED"
                        ? "success"
                        : r.analysis?.status === "FAILED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {r.analysis?.status ?? "PENDING"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
