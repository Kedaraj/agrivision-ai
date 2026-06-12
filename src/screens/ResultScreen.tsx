import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Droplet, Pill, Download, Share2, Leaf } from 'lucide-react';

interface ScanResult {
  scan_id: string; image_url: string; image_preview?: string; disease_name: string;
  confidence: number; severity: string; description: string;
  causes: string[]; fertilizers: string[]; pesticides: string[];
}

function sevStyle(s: string) {
  if (s === 'None') return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
  if (s === 'Low') return { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' };
  if (s === 'Moderate') return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
  return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
}

export function ResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as ScanResult | null;

  if (!result) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 20 }}>
      <Leaf size={48} color="#e5e7eb" style={{ marginBottom: 12 }} />
      <p style={{ color: '#6b7280', textAlign: 'center', fontSize: 14 }}>No scan result found.<br />Please scan a leaf first.</p>
      <button onClick={() => navigate('/scan')} style={{ marginTop: 16, padding: '12px 24px', background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 20, fontWeight: 600 }}>Go to Scanner</button>
    </div>
  );

  const healthy = result.disease_name === 'Healthy Crop';
  const sev = sevStyle(result.severity);
  const conf = typeof result.confidence === 'number' ? result.confidence : parseFloat(String(result.confidence));

  const download = () => {
    const txt = `AgriVision AI Report\nDate: ${new Date().toLocaleDateString()}\n\nDisease: ${result.disease_name}\nConfidence: ${conf.toFixed(1)}%\nSeverity: ${result.severity}\n\n${result.description}\n\nCauses:\n${result.causes.map(c => `• ${c}`).join('\n')}\n\nFertilizers:\n${result.fertilizers.map(f => `• ${f}`).join('\n')}\n\nPesticides:\n${result.pesticides.map(p => `• ${p}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
    Object.assign(document.createElement('a'), { href: url, download: `AgriVision_${result.scan_id?.slice(0, 8) || 'report'}.txt` }).click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const text = `AgriVision AI: ${result.disease_name} (${conf.toFixed(1)}% confidence)`;
    if (navigator.share) await navigator.share({ title: 'AgriVision AI', text });
    else { await navigator.clipboard.writeText(text); alert('Copied!'); }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', paddingBottom: 32 }}>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 32, marginBottom: 16 }}>
          <button onClick={() => navigate('/scan')} style={{ width: 38, height: 38, background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={16} color="#6b7280" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Detection Results</h1>
        </div>

        {/* Image */}
        <div style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <img src={result.image_preview || result.image_url} alt="analyzed" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
        </div>

        {/* Result card */}
        <div style={{ background: healthy ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${healthy ? '#bbf7d0' : '#fecaca'}`, borderRadius: 28, padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{ width: 50, height: 50, background: healthy ? 'linear-gradient(135deg,#22c55e,#34d399)' : 'linear-gradient(135deg,#ef4444,#f97316)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: healthy ? '0 4px 16px rgba(34,197,94,0.4)' : '0 4px 16px rgba(239,68,68,0.4)' }}>
              <CheckCircle2 size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 3 }}>{healthy ? 'Status' : 'Disease Detected'}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: healthy ? '#16a34a' : '#dc2626' }}>{result.disease_name}</div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Confidence</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{conf.toFixed(1)}%</span>
            </div>
            <div style={{ height: 10, background: 'rgba(0,0,0,0.08)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${conf}%`, background: 'linear-gradient(to right,#22c55e,#34d399)', borderRadius: 5 }} />
            </div>
          </div>

          {result.severity !== 'None' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: sev.bg, border: `1px solid ${sev.border}`, borderRadius: 16 }}>
              <AlertCircle size={20} color={sev.text} style={{ flexShrink: 0 }} />
              <div><div style={{ fontSize: 11, color: '#6b7280' }}>Severity Level</div><div style={{ fontSize: 16, fontWeight: 700, color: sev.text }}>{result.severity}</div></div>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: 20, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10 }}>📋 Description</h3>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>{result.description}</p>
        </div>

        {/* Causes */}
        {result.causes?.length > 0 && (
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: 20, marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>⚠️ Causes</h3>
            <ul style={{ listStyle: 'none' }}>
              {result.causes.map(c => (
                <li key={c} style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#22c55e', fontWeight: 700 }}>•</span>{c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fertilizers */}
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 24, padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Droplet size={16} color="#2563eb" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Recommended Fertilizers</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.fertilizers?.map(f => (
              <div key={f} style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, fontSize: 14, color: '#374151' }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Pesticides */}
        <div style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: 24, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Pill size={16} color="#9333ea" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Recommended Pesticides</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.pesticides?.map(p => (
              <div key={p} style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, fontSize: 14, color: '#374151' }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={download} style={{ padding: 14, background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(34,197,94,0.35)', fontSize: 14 }}>
            <Download size={16} />Download
          </button>
          <button onClick={share} style={{ padding: 14, background: '#fff', border: '1.5px solid #e5e7eb', color: '#374151', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
            <Share2 size={16} />Share
          </button>
        </div>
      </div>
    </div>
  );
}
