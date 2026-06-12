import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Droplets, Wind, MapPin, Scan, Plus, TrendingUp, MessageSquare, Bell, Sprout, Loader2, AlertCircle, Navigation, BarChart3 } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Weather { city: string; temperature: number; description: string; humidity: number; wind_speed: number; cloud_cover: number; source?: string; }
interface FarmStats { total_farms: number; total_acres: number; avg_health: number; health_status: string; }
interface Notif { id: string; title: string; message: string; type: string; created_at: string; }

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [stats, setStats] = useState<FarmStats | null>(null);
  const [alerts, setAlerts] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    const loadAll = async (params = '') => {
      try {
        const [w, s, n] = await Promise.all([
          api.get<Weather>(`/api/weather${params}`),
          api.get<FarmStats>('/api/farms/stats'),
          api.get<{ notifications: Notif[]; unread_count: number }>('/api/notifications'),
        ]);
        setWeather(w); setStats(s);
        setAlerts(n.notifications.slice(0, 3));
        setUnread(n.unread_count);
      } catch (e) { console.error(e); }
      finally { setLoading(false); setLocating(false); }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => loadAll(`?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
        () => loadAll(),
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else { loadAll(); }
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Farmer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 100 }}>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 36, marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="AgriVision AI" style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }} />
            <div>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>{greeting} 🌾</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{firstName}</h1>
            </div>
          </div>
          <button onClick={() => navigate('/notifications')}
            style={{ width: 46, height: 46, background: '#f9fafb', border: '1.5px solid #f3f4f6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Bell size={20} color="#374151" />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: 'linear-gradient(135deg,#ef4444,#f97316)', borderRadius: '50%', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>

        {/* Weather Card */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 28, padding: 22, marginBottom: 20, boxShadow: '0 8px 32px rgba(59,130,246,0.25)' }}>
          {loading || !weather ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 90, gap: 10 }}>
              <Loader2 size={28} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              {locating && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>📍 Detecting your location...</p>}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Navigation size={12} color="rgba(255,255,255,0.8)" />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>
                      {weather.city}
                      {weather.source === 'live' && <span style={{ marginLeft: 6, padding: '1px 7px', background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>LIVE</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{weather.temperature}°</div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textTransform: 'capitalize' }}>{weather.description}</div>
                </div>
                <Cloud size={60} color="rgba(255,255,255,0.4)" />
              </div>
              <div style={{ display: 'flex', gap: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                {[
                  { icon: Droplets, val: `${weather.humidity}%`, label: 'Humidity' },
                  { icon: Wind, val: `${weather.wind_speed} km/h`, label: 'Wind' },
                  { icon: Cloud, val: `${weather.cloud_cover}%`, label: 'Cloud' },
                ].map(({ icon: I, val, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <I size={14} color="rgba(255,255,255,0.8)" />
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{val}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Farm Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Total Land', value: `${stats?.total_acres ?? 0}`, unit: 'Acres', bg: '#f0fdf4', border: '#bbf7d0', c: '#16a34a' },
            { label: 'Active Crops', value: `${stats?.total_farms ?? 0}`, unit: 'Fields', bg: '#faf5ff', border: '#e9d5ff', c: '#9333ea' },
            { label: 'Health Score', value: `${stats?.avg_health ?? 0}%`, unit: stats?.health_status || 'Good', bg: '#fff7ed', border: '#fed7aa', c: '#ea580c' },
            { label: 'Alerts', value: `${unread}`, unit: 'Unread', bg: '#eff6ff', border: '#bfdbfe', c: '#2563eb' },
          ].map(c => (
            <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 22, padding: 16 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1, marginBottom: 2 }}>{loading ? '—' : c.value}</div>
              <div style={{ fontSize: 11, color: c.c, fontWeight: 600 }}>{c.unit}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Scan Disease', icon: Scan, bg: 'linear-gradient(135deg,#22c55e,#34d399)', path: '/scan', shadow: '0 4px 16px rgba(34,197,94,0.35)' },
            { label: 'My Farms', icon: Plus, bg: 'linear-gradient(135deg,#a855f7,#f472b6)', path: '/farms', shadow: '0 4px 16px rgba(168,85,247,0.35)' },
            { label: 'Analytics', icon: TrendingUp, bg: 'linear-gradient(135deg,#3b82f6,#06b6d4)', path: '/analytics', shadow: '0 4px 16px rgba(59,130,246,0.35)' },
            { label: 'AI Assistant', icon: MessageSquare, bg: 'linear-gradient(135deg,#f97316,#facc15)', path: '/ai-assistant', shadow: '0 4px 16px rgba(249,115,22,0.35)' },
            { label: 'Market News', icon: BarChart3, bg: 'linear-gradient(135deg,#ec4899,#f43f5e)', path: '/market', shadow: '0 4px 16px rgba(236,72,153,0.35)' },
            { label: 'Crop Prices', icon: TrendingUp, bg: 'linear-gradient(135deg,#14b8a6,#0891b2)', path: '/market', shadow: '0 4px 16px rgba(20,184,166,0.35)' },
          ].map(({ label, icon: Icon, bg, path, shadow }) => (
            <button key={label} onClick={() => navigate(path)}
              style={{ background: '#fff', border: '1.5px solid #f3f4f6', borderRadius: 22, padding: 18, textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 48, height: 48, background: bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: shadow }}>
                <Icon size={22} color="#fff" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{label}</div>
            </button>
          ))}
        </div>

        {/* Alerts */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Recent Alerts</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Loader2 size={22} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : alerts.length === 0 ? (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: 16, textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontSize: 14 }}>✅ All clear — your farm is healthy!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(a => (
              <div key={a.id} style={{ background: a.type === 'alert' ? '#fef2f2' : '#eff6ff', border: `1.5px solid ${a.type === 'alert' ? '#fecaca' : '#bfdbfe'}`, borderRadius: 20, padding: 14, display: 'flex', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: a.type === 'alert' ? '#fee2e2' : '#dbeafe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={18} color={a.type === 'alert' ? '#ef4444' : '#3b82f6'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.message}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>{timeAgo(a.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Tip */}
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1.5px solid #bbf7d0', borderRadius: 28, padding: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#16a34a' }}>AI Recommendation</span>
          </div>
          <p style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.65 }}>
            {weather?.humidity && weather.humidity > 70
              ? '⚠️ High humidity detected! Apply fungicide preventively and ensure good air circulation.'
              : '✅ Conditions look optimal. Apply balanced NPK fertilizer this week for maximum yield.'}
          </p>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
