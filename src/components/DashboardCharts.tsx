"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ChartData {
  monthlyData: { month: string; ca: number; marge: number }[];
  brandData: { name: string; value: number }[];
}

const COLORS = ["#0d9488", "#059669", "#0284c7", "#7c3aed", "#db2777", "#ea580c", "#d97706", "#64748b"];

function formatK(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toString();
}

export default function DashboardCharts({ data }: { data: ChartData }) {
  if (data.monthlyData.length < 2 && data.brandData.length < 2) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* CA + Marge mensuelle */}
      {data.monthlyData.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-3">CA et marge (12 mois)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 10 }} stroke="#cbd5e1" tickFormatter={formatK} />
              <Tooltip formatter={(v) => `${Number(v).toLocaleString("fr-FR")} €`} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="ca" fill="#0d9488" radius={[3, 3, 0, 0]} name="CA" />
              <Bar dataKey="marge" fill="#059669" radius={[3, 3, 0, 0]} name="Marge" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Répartition par marque */}
      {data.brandData.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-3">Par marque</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={data.brandData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                  {data.brandData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1">
              {data.brandData.slice(0, 6).map((b, i) => (
                <div key={b.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted">{b.name}</span>
                  <span className="font-bold tabular-nums">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
