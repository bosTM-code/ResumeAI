"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  name: z.string().min(2, "Мінімум 2 символи"),
  email: z.string().email("Невірний формат email"),
  password: z.string().min(6, "Мінімум 6 символів"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Паролі не збігаються",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Помилка реєстрації");
      return;
    }
    router.push("/login?registered=1");
  };

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Реєстрація</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Підтвердіть пароль"
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Зареєструватись
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Вже маєте акаунт?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Увійти
        </Link>
      </p>
    </Card>
  );
}
