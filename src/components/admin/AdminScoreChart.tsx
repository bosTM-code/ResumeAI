"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

interface Props {
  data: { date: string; score: number }[];
}

export default function AdminScoreChart({ data }: Props) {
  const chartData = useMemo(() => {
    const grouped: Record<string, number[]> = {};
    data.forEach(({ date, score }) => {
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(score);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scores]) => ({
        date: date.slice(5),
        avg: Math.round(scores.reduce((s, n) => s + n, 0) / scores.length),
      }));
  }, [data]);

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Немає даних</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="avg" fill="#6366f1" name="Середній бал" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
