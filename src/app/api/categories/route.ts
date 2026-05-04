import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, BLOG_BUCKET } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) ?? "";
  const image = formData.get("image") as File | null;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Назва обов'язкова" }, { status: 400 });
  }

  const slug = slugify(name);
  let imageUrl: string | undefined;
  let imagePath: string | undefined;

  if (image && image.size > 0) {
    imagePath = `categories/${slug}-${Date.now()}`;
    imageUrl = await uploadFile(BLOG_BUCKET, imagePath, Buffer.from(await image.arrayBuffer()), image.type);
  }

  const category = await prisma.blogCategory.create({
    data: { name, slug, description, imageUrl, imagePath },
  });

  return NextResponse.json(category, { status: 201 });
}
