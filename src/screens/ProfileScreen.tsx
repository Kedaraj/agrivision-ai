import { useState, useEffect } from 'react';
import { User, MapPin, Award, Sprout, Settings, LogOut, ChevronRight, Loader2, Edit2, Check, X } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Profile { id: string; name: string; email: string; phone?: string; location?: string; farm_count: number; scan_count: number; total_acres: number; }

export function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get<Profile>('/api/auth/profile').then(p => { setProfile(p); setEditName(p.name || ''); setEditPhone(p.phone || ''); setEditLoc(p.location || ''); }).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/api/auth/profile', { name: editName, phone: editPhone, location: editLoc }); await refreshUser(); await load(); setEditing(false); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 14, color: '#111827', boxSizing: 'border-box', fontFamily: 'inherit' };

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}><Loader2 size={32} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} /></div>;

  const p = profile;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 100 }}>
      <div style={{ padding: '36px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Profile 👤</h1>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Manage your account</p>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ width: 38, height: 38, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {editing ? <X size={16} color="#6b7280" /> : <Edit2 size={16} color="#6b7280" />}
          </button>
        </div>

        {/* Hero card */}
        <div style={{ background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: 28, padding: 22, marginBottom: 16, boxShadow: '0 8px 32px rgba(34,197,94,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={30} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inp, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', marginBottom: 0 }} placeholder="Your name" />
              ) : (
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{p?.name || user?.name}</div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{p?.email || user?.email}</div>
            </div>
          </div>
          {editing ? (
            <input value={editLoc} onChange={e => setEditLoc(e.target.value)} style={{ ...inp, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }} placeholder="Your location" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}><MapPin size={13} />{p?.location || 'Punjab, India'}</div>
          )}
        </div>

        {editing && (
          <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: 16, marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Phone Number</label>
            <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" style={{ ...inp, marginBottom: 14 }} />
            <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Check size={15} />Save Changes</>}
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { n: p?.farm_count ?? 0, l: 'Farms', icon: Sprout, bg: '#f0fdf4', border: '#bbf7d0', c: '#16a34a' },
            { n: p?.total_acres ?? 0, l: 'Acres', icon: MapPin, bg: '#faf5ff', border: '#e9d5ff', c: '#9333ea' },
            { n: p?.scan_count ?? 0, l: 'Scans', icon: Award, bg: '#fff7ed', border: '#fed7aa', c: '#ea580c' },
          ].map(x => (
            <div key={x.l} style={{ background: x.bg, border: `1.5px solid ${x.border}`, borderRadius: 20, padding: 14, textAlign: 'center' }}>
              <x.icon size={22} color={x.c} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{x.n}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{x.l}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Achievements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {(p?.scan_count ?? 0) > 0 && (
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 20, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#fbbf24,#f97316)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Award size={20} color="#fff" /></div>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>AI Scanner ✓</div><div style={{ fontSize: 12, color: '#6b7280' }}>Completed {p?.scan_count} scan{(p?.scan_count ?? 0) > 1 ? 's' : ''}</div></div>
            </div>
          )}
          {(p?.farm_count ?? 0) >= 1 && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sprout size={20} color="#fff" /></div>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Smart Farmer</div><div style={{ fontSize: 12, color: '#6b7280' }}>Managing {p?.farm_count} farm{(p?.farm_count ?? 0) > 1 ? 's' : ''}</div></div>
            </div>
          )}
          {(p?.farm_count ?? 0) === 0 && (p?.scan_count ?? 0) === 0 && (
            <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: 16, textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Scan crops and add farms to earn achievements 🌱</p>
            </div>
          )}
        </div>

        {/* Account */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Account</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('/farms')} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Sprout size={17} color="#22c55e" /><span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>My Farms</span></div>
            <ChevronRight size={16} color="#9ca3af" />
          </button>
          <button style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Settings size={17} color="#6b7280" /><span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Settings</span></div>
            <ChevronRight size={16} color="#9ca3af" />
          </button>
          <button onClick={() => { logout(); navigate('/login', { replace: true }); }} style={{ background: '#fff', border: '1.5px solid #fecaca', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><LogOut size={17} color="#ef4444" /><span style={{ fontWeight: 600, fontSize: 14, color: '#dc2626' }}>Logout</span></div>
            <ChevronRight size={16} color="#fca5a5" />
          </button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
