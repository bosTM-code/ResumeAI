"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Mail, MessageSquare } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Мінімум 2 символи"),
  email: z.string().email("Невірний формат email"),
  subject: z.string().min(3, "Вкажіть тему"),
  message: z.string().min(10, "Мінімум 10 символів"),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Не вдалося надіслати повідомлення");
      return;
    }
    setSent(true);
    reset();
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Контакти</h1>
          <p className="text-gray-600">
            Маєте питання? Напишіть нам — ми відповімо якнайшвидше.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 p-2.5 rounded-xl">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">support@resumeai.ua</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 p-2.5 rounded-xl">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Підтримка</p>
                <p className="text-sm text-gray-500">Пн–Пт, 9:00–18:00</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Card>
              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Повідомлення надіслано!</h3>
                  <p className="text-gray-500 text-sm mb-4">Ми зв'яжемося з вами найближчим часом.</p>
                  <Button variant="outline" onClick={() => setSent(false)}>Надіслати ще</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Ім'я"
                      placeholder="Іван Іванов"
                      {...register("name")}
                      error={errors.name?.message}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      error={errors.email?.message}
                    />
                  </div>
                  <Input
                    label="Тема"
                    placeholder="Питання щодо аналізу"
                    {...register("subject")}
                    error={errors.subject?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Повідомлення</label>
                    <textarea
                      rows={5}
                      placeholder="Ваше повідомлення..."
                      {...register("message")}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.message ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" loading={isSubmitting}>
                    Надіслати
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
