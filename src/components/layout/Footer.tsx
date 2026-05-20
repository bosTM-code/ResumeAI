import Link from "next/link";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <FileText className="h-5 w-5 text-indigo-400" />
              ResumeAI
            </div>
            <p className="text-sm">
              Сервіс аналізу резюме на основі штучного інтелекту. Отримайте детальні рекомендації щодо покращення вашого резюме.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Сервіс</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/upload" className="hover:text-white transition-colors">Завантажити резюме</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Блог</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Про нас</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Підтримка</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Контакти</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Увійти</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Реєстрація</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} ResumeAI. Всі права захищені.
        </div>
      </div>
    </footer>
  );
}
