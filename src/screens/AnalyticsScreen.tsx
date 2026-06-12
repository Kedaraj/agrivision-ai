import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign, Loader2 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BottomNavigation } from '../components/BottomNavigation';
import { api } from '../lib/api';

interface Analytics {
  summary: { total_scans: number; disease_detected: number; healthy_crops: number; avg_health: number; active_fields: number; total_acres: number; yield_estimate: string; revenue_estimate: string; };
  growth_data: { month: string; value: number }[];
  revenue_data: { month: string; value: number }[];
  disease_history: { id: number; name: string; cases: number }[];
}

export function AnalyticsScreen() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get<Analytics>('/api/analytics').then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={40} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading analytics...</p>
    </div>
  );

  const s = data?.summary;
  const cards = [
    { label: 'Avg. Health', value: `${s?.avg_health ?? 0}%`, icon: TrendingUp, bg: '#f0fdf4', border: '#bbf7d0', ibg: 'linear-gradient(135deg,#22c55e,#34d399)' },
    { label: 'Active Fields', value: `${s?.active_fields ?? 0}`, icon: Activity, bg: '#eff6ff', border: '#bfdbfe', ibg: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
    { label: 'Yield Est.', value: s?.yield_estimate ?? '—', icon: BarChart3, bg: '#faf5ff', border: '#e9d5ff', ibg: 'linear-gradient(135deg,#a855f7,#f472b6)' },
    { label: 'Revenue', value: s?.revenue_estimate ?? '—', icon: DollarSign, bg: '#fff7ed', border: '#fed7aa', ibg: 'linear-gradient(135deg,#f97316,#facc15)' },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 100 }}>
      <div style={{ padding: '36px 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Farm Analytics 📊</h1>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Track your farm performance</p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 22, padding: 16 }}>
              <div style={{ width: 38, height: 38, background: c.ibg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <c.icon size={18} color="#fff" />
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Scan summary */}
        <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: 18, display: 'flex', marginBottom: 20 }}>
          {[{ n: s?.total_scans ?? 0, l: 'Total Scans', c: '#111827' }, { n: s?.disease_detected ?? 0, l: 'Diseases', c: '#dc2626' }, { n: s?.healthy_crops ?? 0, l: 'Healthy', c: '#16a34a' }].map((x, i, arr) => (
            <div key={x.l} style={{ flex: 1, textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: x.c }}>{x.n}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{x.l}</div>
            </div>
          ))}
        </div>

        {/* Health chart */}
        {data?.growth_data && data.growth_data.length > 0 && (
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Crop Health Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.growth_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue chart */}
        {data?.revenue_data && data.revenue_data.length > 0 && (
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Revenue Analytics</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data.revenue_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Disease history */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 24, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Disease History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data?.disease_history?.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{d.name}</span>
                <span style={{ padding: '4px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{d.cases} case{d.cases !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
