export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { resumes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Користувачі</h1>
      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Ім&apos;я</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Резюме</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Дата реєстрації</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <Badge variant={user.role === "ADMIN" ? "info" : "default"}>{user.role}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user._count.resumes}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
