import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/types/admin";

export function StatsChart({
  title,
  data,
  type = "area",
  dataKey,
}: {
  title: string;
  data: ChartPoint[];
  type?: "area" | "bar";
  dataKey: "revenue" | "orders" | "products";
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <h3 className="font-display text-2xl text-white">{title}</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`${dataKey}-gold`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f4d58d" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#f4d58d" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(246,234,208,0.55)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(246,234,208,0.45)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#100d0a", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Area type="monotone" dataKey={dataKey} stroke="#f4d58d" fill={`url(#${dataKey}-gold)`} strokeWidth={2} />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(246,234,208,0.55)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(246,234,208,0.45)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#100d0a", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Bar dataKey={dataKey} fill="#d7b46a" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
