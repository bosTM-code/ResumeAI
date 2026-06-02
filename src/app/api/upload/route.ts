import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, RESUME_BUCKET } from "@/lib/supabase";
import { extractTextFromFile } from "@/lib/resumeParser";
import { analyzeResume } from "@/lib/claude";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Файл не знайдено" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Непідтримуваний тип файлу" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Файл перевищує 10 МБ" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${session.user.id}/${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  let fileUrl: string;
  try {
    fileUrl = await uploadFile(RESUME_BUCKET, storagePath, buffer, file.type);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Storage upload error:", msg);
    return NextResponse.json({ error: `Помилка збереження файлу: ${msg}` }, { status: 500 });
  }

  // Create resume record
  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      fileName: file.name,
      fileType: file.type.includes("pdf") ? "pdf" : file.type.includes("msword") ? "doc" : "docx",
      fileSize: file.size,
      fileUrl,
      storagePath,
    },
  });

  // Create pending analysis
  const analysis = await prisma.resumeAnalysis.create({
    data: { resumeId: resume.id, status: "PENDING" },
  });

  await runAnalysis(resume.id, analysis.id, buffer, file.type);

  return NextResponse.json({ resumeId: resume.id }, { status: 201 });
}

async function runAnalysis(
  resumeId: string,
  analysisId: string,
  buffer: Buffer,
  mimeType: string
) {
  try {
    const text = await extractTextFromFile(buffer, mimeType);
    const result = await analyzeResume(text);

    await prisma.resumeAnalysis.update({
      where: { id: analysisId },
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
  } catch (err) {
    console.error("Analysis failed for resume", resumeId, err);
    await prisma.resumeAnalysis.update({
      where: { id: analysisId },
      data: { status: "FAILED" },
    });
  }
}
