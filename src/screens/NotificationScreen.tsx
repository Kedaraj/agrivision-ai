import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Droplets, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { api } from '../lib/api';

interface Notif { id: string; title: string; message: string; type: string; is_read: number; created_at: string; }

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationScreen() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ notifications: Notif[]; unread_count: number }>('/api/notifications')
      .then(r => setNotifs(r.notifications)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markAll = async () => { await api.put('/api/notifications/read-all'); setNotifs(p => p.map(n => ({ ...n, is_read: 1 }))); };
  const markRead = async (id: string) => { await api.put(`/api/notifications/${id}/read`); setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: 1 } : n)); };
  const del = async (id: string) => { await api.delete(`/api/notifications/${id}`); setNotifs(p => p.filter(n => n.id !== id)); };

  const unread = notifs.filter(n => !n.is_read).length;

  const getStyle = (type: string) => type === 'alert'
    ? { bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', iconColor: '#ef4444' }
    : type === 'water'
    ? { bg: '#eff6ff', border: '#bfdbfe', iconBg: '#dbeafe', iconColor: '#3b82f6' }
    : { bg: '#faf5ff', border: '#e9d5ff', iconBg: '#f3e8ff', iconColor: '#a855f7' };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 100 }}>
      <div style={{ padding: '36px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Notifications 🔔</h1>
            <p style={{ color: '#6b7280', fontSize: 13 }}>{unread > 0 ? `${unread} unread alerts` : 'All caught up!'}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
              <CheckCheck size={14} />Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
            <Loader2 size={28} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <Bell size={48} color="#e5e7eb" style={{ margin: '0 auto 14px', display: 'block' }} />
            <p style={{ color: '#9ca3af', fontSize: 14 }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifs.map(n => {
              const st = getStyle(n.type);
              return (
                <div key={n.id} onClick={() => markRead(n.id)}
                  style={{ background: st.bg, border: `1.5px solid ${st.border}`, borderRadius: 20, padding: 14, display: 'flex', gap: 12, cursor: 'pointer', opacity: n.is_read ? 0.65 : 1 }}>
                  <div style={{ width: 42, height: 42, background: st.iconBg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {n.type === 'water' ? <Droplets size={18} color={st.iconColor} /> : <AlertCircle size={18} color={st.iconColor} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{n.title}</span>
                      {!n.is_read && <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{timeAgo(n.created_at)}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); del(n.id); }}
                    style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trash2 size={13} color="#9ca3af" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
