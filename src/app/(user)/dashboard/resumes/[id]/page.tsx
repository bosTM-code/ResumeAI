export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { scoreBg, formatBytes, formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle, XCircle, Download } from "lucide-react";
import DeleteResumeButton from "@/components/dashboard/DeleteResumeButton";
import ReanalyzeButton from "@/components/dashboard/ReanalyzeButton";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: { analysis: true },
  });

  if (!resume) notFound();

  const a = resume.analysis;

  const sections = a
    ? [
        { label: "Структура", score: a.structureScore ?? 0 },
        { label: "Контакти", score: a.contactScore ?? 0 },
        { label: "Досвід", score: a.experienceScore ?? 0 },
        { label: "Освіта", score: a.educationScore ?? 0 },
        { label: "Навички", score: a.skillsScore ?? 0 },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/resumes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{resume.fileName}</h1>
          <p className="text-sm text-gray-500">
            {resume.fileType.toUpperCase()} · {formatBytes(resume.fileSize)} · {formatDate(resume.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Завантажити
            </Button>
          </a>
          {a && <ReanalyzeButton resumeId={resume.id} />}
          <DeleteResumeButton resumeId={resume.id} />
        </div>
      </div>

      {!a || a.status === "PENDING" ? (
        <Card className="text-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Аналіз виконується...</p>
          <p className="text-sm text-gray-400 mt-1">Оновіть сторінку через кілька секунд</p>
        </Card>
      ) : a.status === "FAILED" ? (
        <Card className="text-center py-16">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Аналіз не вдався</p>
          <p className="text-sm text-gray-400 mt-1">Спробуйте повторний аналіз</p>
          <div className="mt-4">
            <ReanalyzeButton resumeId={resume.id} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 mb-2">Загальний бал</p>
            <div className="text-6xl font-bold text-indigo-600 mb-2">{a.overallScore}</div>
            <div className="text-gray-400 text-sm">/ 100</div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Оцінки по секціях</CardTitle></CardHeader>
            <div className="space-y-3">
              {sections.map(({ label, score }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className={`font-medium ${scoreBg(score)} px-2 py-0.5 rounded-full text-xs`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Наявність секцій</CardTitle></CardHeader>
            <div className="space-y-3">
              {[
                { label: "Контактна інформація", ok: a.hasContact },
                { label: "Досвід роботи", ok: a.hasExperience },
                { label: "Освіта", ok: a.hasEducation },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2">
                  {ok ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Навички</CardTitle></CardHeader>
            <div className="flex flex-wrap gap-2">
              {a.skills.map((s) => (
                <Badge key={s} variant="info">{s}</Badge>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Ключові слова</CardTitle></CardHeader>
            <div className="flex flex-wrap gap-2">
              {a.keywords.map((k) => (
                <Badge key={k}>{k}</Badge>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Рекомендації</CardTitle></CardHeader>
            <ul className="space-y-2">
              {a.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader><CardTitle>Слабкі місця</CardTitle></CardHeader>
            <ul className="space-y-2">
              {a.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
