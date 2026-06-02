import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedUrl, RESUME_BUCKET } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await prisma.resume.findFirst({
    where: {
      id,
      userId: session.user.role === "ADMIN" ? undefined : session.user.id,
    },
  });

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const signedUrl = await getSignedUrl(RESUME_BUCKET, resume.storagePath);
  return NextResponse.redirect(signedUrl);
}
