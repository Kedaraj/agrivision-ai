import { useState, useEffect } from 'react';
import {
  Newspaper, TrendingUp, TrendingDown, Minus, Sprout, RefreshCw,
  Clock, Tag, AlertCircle, Loader2, ChevronRight, Star, Droplets,
  Timer, DollarSign, BarChart2,
} from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { api } from '../lib/api';

interface NewsItem { id: number; title: string; summary: string; category: string; time: string; important: boolean; }
interface Rec { id: number; crop: string; reason: string; profit_potential: string; duration_days: number; investment: string; water_need: string; best_regions: string[]; }
interface Price { id: number; crop: string; price_per_kg: number; trend: string; change_percent: number; market: string; quality: string; }
interface MarketData {
  news: NewsItem[]; recommendations: Rec[]; prices: Price[];
  market_summary: string; season: string; month: string; generated_at: string;
}

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  'Government': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Market': { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  'Technology': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'Weather': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  'Disease Alert': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  'Export': { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
};

const profitColor = { High: '#16a34a', Medium: '#ca8a04', Low: '#dc2626' };
const profitBg = { High: '#f0fdf4', Medium: '#fefce8', Low: '#fef2f2' };
const profitBorder = { High: '#bbf7d0', Medium: '#fef08a', Low: '#fecaca' };

export function MarketScreen() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'news' | 'crops' | 'prices'>('news');
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        const d = await api.post<MarketData>('/api/market/refresh', {});
        setData(d);
      } else {
        const d = await api.get<MarketData>('/api/market');
        setData(d);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const trendIcon = (t: string, pct: number) => {
    if (t === 'up') return { icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4', label: `+${Math.abs(pct).toFixed(1)}%` };
    if (t === 'down') return { icon: TrendingDown, color: '#dc2626', bg: '#fef2f2', label: `-${Math.abs(pct).toFixed(1)}%` };
    return { icon: Minus, color: '#6b7280', bg: '#f9fafb', label: 'Stable' };
  };

  const cropEmoji: Record<string, string> = {
    Tomato: '🍅', Wheat: '🌾', Rice: '🍚', Onion: '🧅', Potato: '🥔',
    Cotton: '🌸', Corn: '🌽', Soybean: '🫘', Chilli: '🌶️', Turmeric: '🟡',
    Garlic: '🧄', Brinjal: '🍆', Cabbage: '🥬', Cauliflower: '🥦', Sugarcane: '🎋',
  };

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', gap: 14 }}>
      <Loader2 size={40} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>🤖 Gemini AI generating market data...</p>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '36px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Market Intelligence 📈</h1>
            <p style={{ color: '#6b7280', fontSize: 13 }}>
              {data?.season} · {data?.month} · AI Generated
            </p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            style={{ width: 40, height: 40, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={16} color="#22c55e" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Market summary banner */}
        {data?.market_summary && (
          <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <BarChart2 size={16} color="#22c55e" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#16a34a' }}>Market Overview</span>
            </div>
            <p style={{ color: '#374151', fontSize: 13, lineHeight: 1.6 }}>{data.market_summary}</p>
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 16, padding: 4, marginBottom: 20 }}>
          {([['news', '📰 News'], ['crops', '🌱 Crops'], ['prices', '💰 Prices']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, color: tab === key ? '#111827' : '#6b7280', background: tab === key ? '#fff' : 'transparent', boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ─── NEWS TAB ─── */}
        {tab === 'news' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data?.news.map(n => {
              const cs = categoryColor[n.category] || categoryColor['Market'];
              return (
                <div key={n.id} onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                  style={{ background: '#fff', border: `1.5px solid ${n.important ? '#fde68a' : '#e5e7eb'}`, borderRadius: 20, padding: 16, cursor: 'pointer', boxShadow: n.important ? '0 2px 12px rgba(234,179,8,0.12)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ padding: '3px 10px', background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{n.category}</span>
                        {n.important && <span style={{ padding: '3px 8px', background: '#fffbeb', border: '1px solid #fde68a', color: '#ca8a04', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>⚡ Important</span>}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', lineHeight: 1.4, marginBottom: 6 }}>{n.title}</p>
                      {expanded === n.id && (
                        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 6 }}>{n.summary}</p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9ca3af', fontSize: 11 }}>
                        <Clock size={11} />{n.time}
                      </div>
                    </div>
                    <ChevronRight size={16} color="#d1d5db" style={{ transform: expanded === n.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── CROP RECOMMENDATIONS TAB ─── */}
        {tab === 'crops' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 16, padding: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sprout size={14} color="#ea580c" />
              <p style={{ color: '#c2410c', fontSize: 12, fontWeight: 600 }}>AI recommendations based on {data?.season} season & current market prices</p>
            </div>

            {data?.recommendations.map((r, i) => {
              const pColor = profitColor[r.profit_potential as keyof typeof profitColor] || '#6b7280';
              const pBg = profitBg[r.profit_potential as keyof typeof profitBg] || '#f9fafb';
              const pBorder = profitBorder[r.profit_potential as keyof typeof profitBorder] || '#e5e7eb';
              return (
                <div key={r.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, background: pBg, border: `2px solid ${pBorder}`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                      {cropEmoji[r.crop] || '🌱'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>#{i + 1} {r.crop}</span>
                        <span style={{ padding: '3px 10px', background: pBg, border: `1px solid ${pBorder}`, color: pColor, borderRadius: 99, fontSize: 10, fontWeight: 800 }}>
                          <Star size={9} style={{ display: 'inline', marginRight: 3 }} />{r.profit_potential} Profit
                        </span>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>{r.reason}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { icon: Timer, label: 'Duration', value: `${r.duration_days}d` },
                      { icon: DollarSign, label: 'Investment', value: r.investment },
                      { icon: Droplets, label: 'Water', value: r.water_need },
                    ].map(x => (
                      <div key={x.label} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 12, padding: '8px 10px', textAlign: 'center' }}>
                        <x.icon size={14} color="#9ca3af" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{x.value}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{x.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Regions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {r.best_regions.map(reg => (
                      <span key={reg} style={{ padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                        📍 {reg}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── PRICES TAB ─── */}
        {tab === 'prices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>CROP</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>₹/KG</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'right' }}>CHANGE</span>
              </div>

              {data?.prices.map((p, i) => {
                const t = trendIcon(p.trend, p.change_percent);
                const TIcon = t.icon;
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '13px 16px', borderBottom: i < (data.prices.length - 1) ? '1px solid #f3f4f6' : 'none', alignItems: 'center', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{cropEmoji[p.crop] || '🌱'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{p.crop}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 90 }}>{p.market}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>₹{p.price_per_kg}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: t.bg, borderRadius: 99 }}>
                        <TIcon size={12} color={t.color} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 11, marginTop: 12 }}>
              <Tag size={10} style={{ display: 'inline', marginRight: 3 }} />
              AI-estimated prices. Verify at your local mandi.
            </p>
          </div>
        )}

        {/* Refresh info */}
        {data?.generated_at && (
          <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 11, marginTop: 16 }}>
            Updated: {new Date(data.generated_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
