import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { ArrowRight, CheckCircle, FileText, Star, Zap } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Підтримка форматів",
    desc: "Завантажуйте резюме у форматах PDF, DOC та DOCX. Підтримуємо всі популярні формати.",
  },
  {
    icon: Zap,
    title: "Миттєвий аналіз",
    desc: "Штучний інтелект аналізує ваше резюме за лічені секунди та надає детальний звіт.",
  },
  {
    icon: Star,
    title: "Персональні рекомендації",
    desc: "Отримайте конкретні поради щодо покращення структури, навичок та ключових слів.",
  },
];

const benefits = [
  "Оцінка загального балу резюме",
  "Аналіз структури та форматування",
  "Перевірка контактної інформації",
  "Виявлення ключових навичок",
  "Рекомендації для кожної секції",
  "Історія завантажених резюме",
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-linear-to-br from-indigo-50 via-white to-purple-50 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Powered by Claude AI
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Покращіть своє резюме{" "}
              <span className="text-indigo-600">з AI-аналізом</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Завантажте резюме та отримайте детальний аналіз сильних і слабких
              сторін, перелік рекомендацій та загальний бал — все за декілька секунд.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Почати безкоштовно
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Дізнатись більше
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Як це працює
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6 rounded-xl bg-gray-50">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-xl mb-4">
                    <Icon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 bg-indigo-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Що входить до аналізу
            </h2>
            <p className="text-indigo-200 mb-10">
              Детальний звіт охоплює всі ключові аспекти вашого резюме
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-5 w-5 text-indigo-300 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Спробувати зараз
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
