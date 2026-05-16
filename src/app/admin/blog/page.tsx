export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import AdminBlogForm from "@/components/admin/AdminBlogForm";
import TogglePublishButton from "@/components/admin/TogglePublishButton";
import DeletePostButton from "@/components/admin/DeletePostButton";

export default async function AdminBlogPage() {
  const [categories, posts] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.blogPost.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Блог</h1>
      <Card className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Нова стаття</h2>
        <AdminBlogForm categories={categories} />
      </Card>
      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Заголовок</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Категорія</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-60 truncate">{post.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{post.category.name}</td>
                <td className="px-6 py-4">
                  <Badge variant={post.published ? "success" : "default"}>
                    {post.published ? "Опубліковано" : "Чернетка"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <TogglePublishButton postId={post.id} published={post.published} />
                    <DeletePostButton postId={post.id} />
                  </div>
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
