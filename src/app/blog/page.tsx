export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [categories, posts] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.blogPost.findMany({
      where: {
        published: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Блог</h1>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/blog"
            className={`rounded-xl px-4 py-2 border-2 text-sm font-medium ${
              !category
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 hover:border-indigo-300 text-gray-700"
            } transition-colors`}
          >
            Всі статті
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className={`rounded-xl px-4 py-2 border-2 text-sm font-medium ${
                category === cat.slug
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 hover:border-indigo-300 text-gray-700"
              } transition-colors`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Статей ще немає. Перевірте пізніше.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {post.category.name}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="text-sm text-indigo-600 font-medium hover:underline">
                    Читати далі →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
