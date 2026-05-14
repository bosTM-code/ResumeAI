"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

interface Props {
  data: { date: string; fileType: string }[];
}

export default function AdminFileTypeChart({ data }: Props) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(({ fileType }) => {
      counts[fileType] = (counts[fileType] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [data]);

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Немає даних</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
