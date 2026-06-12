import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as Img, Upload, X, Loader2, AlertCircle, Scan, Sparkles } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { api } from '../lib/api';

export function ScanScreen() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please select an image file'); return; }
    setError(''); setFile(f);
    const r = new FileReader(); r.onload = e => setPreview(e.target?.result as string); r.readAsDataURL(f);
  };

  const clear = () => { setPreview(null); setFile(null); setError(''); };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true); setError('');
    try {
      const fd = new FormData(); fd.append('image', file);
      const result = await api.upload<{ scan_id: string; image_url: string; disease_name: string; confidence: number; severity: string; description: string; causes: string[]; fertilizers: string[]; pesticides: string[] }>('/api/scan', fd);
      navigate('/result', { state: { ...result, image_preview: preview } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      setScanning(false);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 100 }}>
      <div style={{ padding: '36px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}>
            <Scan size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Disease Scanner</h1>
            <p style={{ color: '#6b7280', fontSize: 12 }}>Powered by Gemini 2.5 Flash AI</p>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, marginBottom: 14 }}>
            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* Upload zone */}
        <div style={{ background: '#f9fafb', border: '2px dashed #d1fae5', borderRadius: 28, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          {preview ? (
            <div style={{ position: 'relative', width: '100%' }}>
              <button onClick={clear} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, background: 'rgba(239,68,68,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <X size={16} color="#fff" />
              </button>
              <img src={preview} alt="leaf" style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 26 }} />
              {scanning && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', borderRadius: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <Loader2 size={36} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>🤖 Gemini AI Analyzing...</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 28 }}>
              <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '2px dashed #22c55e', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Upload size={38} color="#22c55e" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Upload Leaf Photo</h3>
              <p style={{ color: '#6b7280', fontSize: 13 }}>Take a clear photo of the affected leaf<br />for instant AI disease detection</p>
            </div>
          )}
        </div>

        <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />

        {!preview && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <button onClick={() => cameraRef.current?.click()} style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 22, padding: '18px 14px', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
                <Camera size={22} color="#fff" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Open Camera</div>
            </button>
            <button onClick={() => galleryRef.current?.click()} style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: 22, padding: '18px 14px', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#a855f7,#f472b6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(168,85,247,0.35)' }}>
                <Img size={22} color="#fff" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>From Gallery</div>
            </button>
          </div>
        )}

        {preview && !scanning && (
          <button onClick={handleScan} style={{ width: '100%', padding: 17, background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 24, fontWeight: 800, fontSize: 16, boxShadow: '0 4px 20px rgba(34,197,94,0.4)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Sparkles size={20} />Analyze with Gemini AI
          </button>
        )}

        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 18, padding: 14 }}>
          <p style={{ color: '#92400e', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>💡 Tips for accurate results</p>
          <p style={{ color: '#78350f', fontSize: 12, lineHeight: 1.6 }}>• Natural daylight gives best results<br />• Focus clearly on the affected area<br />• Capture spots, discoloration, or wilting</p>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
