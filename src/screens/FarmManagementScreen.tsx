import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MapPin, Activity, Edit2, Trash2, X, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Farm { id: string; name: string; crop: string; area_acres: number; health: number; health_status: string; }
const CROPS = ['Tomato', 'Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane', 'Potato', 'Onion', 'Soybean', 'Other'];

const inp: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: '#f9fafb', border: '1.5px solid #e5e7eb',
  borderRadius: 16, fontSize: 14, color: '#111827',
  boxSizing: 'border-box', fontFamily: 'inherit',
};

export function FarmManagementScreen() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editFarm, setEditFarm] = useState<Farm | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', crop: 'Tomato', area: '', health: '80' });
  const [formErr, setFormErr] = useState('');

  const load = () => api.get<Farm[]>('/api/farms').then(setFarms).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ name: '', crop: 'Tomato', area: '', health: '80' }); setEditFarm(null); setFormErr(''); setModal(true); };
  const openEdit = (f: Farm) => { setForm({ name: f.name, crop: f.crop, area: String(f.area_acres), health: String(f.health) }); setEditFarm(f); setFormErr(''); setModal(true); };
  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.area.trim()) { setFormErr('Name and area are required'); return; }
    setSaving(true); setFormErr('');
    try {
      if (editFarm) { await api.put(`/api/farms/${editFarm.id}`, { name: form.name, crop: form.crop, area_acres: parseFloat(form.area), health: parseInt(form.health) }); setSuccess('Farm updated!'); }
      else { await api.post('/api/farms', { name: form.name, crop: form.crop, area_acres: parseFloat(form.area), health: parseInt(form.health) }); setSuccess('Farm added!'); }
      setModal(false); await load(); setTimeout(() => setSuccess(''), 2500);
    } catch (e: unknown) { setFormErr(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    await api.delete(`/api/farms/${id}`);
    setFarms(p => p.filter(f => f.id !== id));
    setDelId(null); setSuccess('Farm deleted!'); setTimeout(() => setSuccess(''), 2000);
  };

  const hColor = (h: number) => h >= 85 ? '#16a34a' : h >= 70 ? '#ca8a04' : '#dc2626';
  const hBg = (h: number) => h >= 85 ? '#f0fdf4' : h >= 70 ? '#fefce8' : '#fef2f2';

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', position: 'relative' }}>
      <div style={{ padding: '36px 20px 120px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate('/home')} style={{ width: 38, height: 38, background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={16} color="#6b7280" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>My Farms 🌾</h1>
        </div>

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, marginBottom: 14 }}>
            <Check size={15} color="#22c55e" /><p style={{ color: '#16a34a', fontSize: 13 }}>{success}</p>
          </div>
        )}

        <button onClick={openAdd} style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 20px rgba(34,197,94,0.4)', marginBottom: 20, fontSize: 15 }}>
          <Plus size={20} />Add New Farm
        </button>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <Loader2 size={28} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : farms.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🌾</div>
            <p style={{ color: '#6b7280', fontSize: 14 }}>No farms yet — add your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {farms.map(f => (
              <div key={f.id} style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 28, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{f.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13 }}>
                      <MapPin size={13} />{f.area_acres} acres · {f.crop}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(f)} style={{ width: 36, height: 36, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={14} color="#6b7280" />
                    </button>
                    <button onClick={() => setDelId(f.id)} style={{ width: 36, height: 36, background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={13} color="#6b7280" /><span style={{ fontSize: 12, color: '#6b7280' }}>Health Score</span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: hColor(f.health) }}>{f.health}%</span>
                </div>
                <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${f.health}%`, background: 'linear-gradient(to right,#22c55e,#34d399)', borderRadius: 4 }} />
                </div>
                <span style={{ padding: '5px 14px', background: hBg(f.health), border: `1px solid ${hColor(f.health)}33`, borderRadius: 99, fontSize: 12, fontWeight: 700, color: hColor(f.health) }}>
                  {f.health_status}
                </span>

                {delId === f.id && (
                  <div style={{ marginTop: 14, padding: 14, background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 18 }}>
                    <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>Delete "{f.name}"?</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => del(f.id)} style={{ flex: 1, padding: '9px 0', background: '#ef4444', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 13 }}>Delete</button>
                      <button onClick={() => setDelId(null)} style={{ flex: 1, padding: '9px 0', background: '#fff', border: '1.5px solid #e5e7eb', color: '#6b7280', borderRadius: 14, fontSize: 13 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal bottom sheet */}
      {modal && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
          <div style={{ background: '#fff', width: '100%', borderRadius: '28px 28px 0 0', padding: 22, maxHeight: '88%', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{editFarm ? 'Edit Farm' : 'New Farm'}</h2>
              <button onClick={() => setModal(false)} style={{ width: 34, height: 34, background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>

            {formErr && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{formErr}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Farm Name *</label>
                <input type="text" value={form.name} onChange={s('name')} placeholder="e.g. North Field" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Area (acres) *</label>
                <input type="number" value={form.area} onChange={s('area')} placeholder="e.g. 5.5" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Crop Type</label>
                <select value={form.crop} onChange={s('crop')} style={inp}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                  Health Score: <span style={{ color: '#22c55e', fontWeight: 700 }}>{form.health}%</span>
                </label>
                <input type="range" min="0" max="100" value={form.health} onChange={s('health')} style={{ width: '100%', accentColor: '#22c55e' }} />
              </div>
            </div>

            <button onClick={save} disabled={saving}
              style={{ width: '100%', padding: 15, background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(34,197,94,0.35)', fontSize: 15 }}>
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{editFarm ? 'Saving...' : 'Adding...'}</> : (editFarm ? 'Save Changes' : 'Add Farm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
