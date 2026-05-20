import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, BLOG_BUCKET } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = (formData.get("excerpt") as string) ?? "";
  const categoryId = formData.get("categoryId") as string;
  const image = formData.get("image") as File | null;

  if (!title?.trim() || !content?.trim() || !categoryId) {
    return NextResponse.json({ error: "Заповніть всі поля" }, { status: 400 });
  }

  const slug = `${slugify(title)}-${Date.now()}`;
  let imageUrl: string | undefined;
  let imagePath: string | undefined;

  if (image && image.size > 0) {
    imagePath = `posts/${slug}`;
    imageUrl = await uploadFile(
      BLOG_BUCKET,
      imagePath,
      Buffer.from(await image.arrayBuffer()),
      image.type
    );
  }

  const post = await prisma.blogPost.create({
    data: { title, slug, content, excerpt, categoryId, imageUrl, imagePath, published: true },
  });

  return NextResponse.json(post, { status: 201 });
}
