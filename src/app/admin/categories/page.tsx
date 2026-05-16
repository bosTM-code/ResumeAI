export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Категорії блогу</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Нова категорія</h2>
          <AdminCategoryForm />
        </Card>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Назва</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Опис</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Статті</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.description ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat._count.posts}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(cat.createdAt)}</td>
                <td className="px-6 py-4">
                  <DeleteCategoryButton categoryId={cat.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
