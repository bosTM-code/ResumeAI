import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, BLOG_BUCKET } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const category = await prisma.blogCategory.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (category.imagePath) {
    await deleteFile(BLOG_BUCKET, category.imagePath).catch(console.error);
  }

  await prisma.blogCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
