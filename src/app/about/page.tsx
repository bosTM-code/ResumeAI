import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, FileText, Zap, Star, Shield } from "lucide-react";

const advantages = [
  {
    icon: FileText,
    title: "Підтримка PDF та DOCX",
    desc: "Завантажуйте резюме у найпоширеніших форматах без конвертації.",
  },
  {
    icon: Zap,
    title: "Миттєвий аналіз ШІ",
    desc: "Результати аналізу готові за секунди завдяки Claude AI від Anthropic.",
  },
  {
    icon: Star,
    title: "Деталізований звіт",
    desc: "Оцінки по кожній секції: контакти, досвід, освіта, навички, структура.",
  },
  {
    icon: Shield,
    title: "Безпека даних",
    desc: "Ваші файли зберігаються у захищеному хмарному сховищі Supabase.",
  },
  {
    icon: CheckCircle,
    title: "Персональні рекомендації",
    desc: "Конкретні поради для кожного слабкого місця у вашому резюме.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-linear-to-br from-indigo-50 to-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Про нас</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              ResumeAI — це сучасний сервіс аналізу резюме на основі штучного інтелекту.
              Ми допомагаємо шукачам роботи зробити своє резюме сильнішим, виразнішим
              та більш конкурентоспроможним на ринку праці.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Наша місія</h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
              Кожна людина заслуговує на роботу своєї мрії. Але недосконале резюме часто
              стає бар'єром між кандидатом і роботодавцем. Ми прибираємо цей бар'єр,
              надаючи об'єктивну, детальну та дієву оцінку кожного резюме.
            </p>
            <div className="bg-indigo-50 rounded-2xl p-8 text-center">
              <p className="text-indigo-800 font-medium text-lg">
                "Покращте резюме — отримайте роботу мрії"
              </p>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
              Чому обирають ResumeAI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advantages.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
