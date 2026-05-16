import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    include: { category: true },
  });

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад до блогу
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full"
          >
            {post.category.name}
          </Link>
          <span className="text-sm text-gray-400">{formatDate(post.createdAt)}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

        {post.imageUrl && (
          <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
          </div>
        )}

        <article className="prose prose-gray max-w-none">
          {post.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
