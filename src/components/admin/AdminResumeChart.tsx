"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

interface Props {
  data: { date: string; fileType: string }[];
}

export default function AdminResumeChart({ data }: Props) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(({ date }) => {
      counts[date] = (counts[date] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [data]);

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Немає даних</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          name="Резюме"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
