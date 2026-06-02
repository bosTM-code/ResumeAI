import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase, RESUME_BUCKET } from "@/lib/supabase";
import { extractTextFromFile } from "@/lib/resumeParser";
import { analyzeResume } from "@/lib/claude";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: { analysis: true },
  });

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Reset or create analysis record
  const analysisId = resume.analysis?.id;
  const analysis = analysisId
    ? await prisma.resumeAnalysis.update({
        where: { id: analysisId },
        data: { status: "PENDING" },
      })
    : await prisma.resumeAnalysis.create({
        data: { resumeId: resume.id, status: "PENDING" },
      });

  // Download file from Supabase for re-analysis
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .download(resume.storagePath);

  if (error || !data) {
    await prisma.resumeAnalysis.update({
      where: { id: analysis.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "File not accessible" }, { status: 500 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  const mimeType = mimeMap[resume.fileType] ?? "application/pdf";

  try {
    const text = await extractTextFromFile(buffer, mimeType);
    const result = await analyzeResume(text);
    await prisma.resumeAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "COMPLETED",
        overallScore: result.overallScore,
        structureScore: result.structureScore,
        contactScore: result.contactScore,
        experienceScore: result.experienceScore,
        educationScore: result.educationScore,
        skillsScore: result.skillsScore,
        hasContact: result.hasContact,
        hasExperience: result.hasExperience,
        hasEducation: result.hasEducation,
        skills: result.skills,
        keywords: result.keywords,
        recommendations: result.recommendations,
        weaknesses: result.weaknesses,
        rawAnalysis: result as object,
      },
    });
  } catch {
    await prisma.resumeAnalysis.update({
      where: { id: analysis.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
