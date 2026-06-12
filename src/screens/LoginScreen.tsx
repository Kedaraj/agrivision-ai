import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Please enter email and password'); return; }
    setError(''); setLoading(true);
    try { await login(email.trim(), password); navigate('/home', { replace: true }); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px 14px 46px',
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: 16, fontSize: 15, color: '#111827',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', background: '#fff' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <img
          src="/logo.png"
          alt="AgriVision AI Logo"
          style={{ width: 90, height: 90, borderRadius: 24, objectFit: 'cover', margin: '0 auto 16px', display: 'block', boxShadow: '0 8px 32px rgba(34,197,94,0.35)' }}
        />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111827', marginBottom: 6 }}>AgriVision AI</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Sign in to your farm dashboard</p>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', borderRadius: 28, padding: 24, border: '1.5px solid #f3f4f6', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, marginBottom: 16 }}>
            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="email" style={inp} />
          </div>
          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="current-password" style={{ ...inp, paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 20, fontWeight: 700, fontSize: 16, boxShadow: '0 4px 20px rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Signing in...</> : '🚀  Sign In'}
        </button>
      </div>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 22 }}>
        Don't have an account?{' '}
        <button onClick={() => navigate('/signup')} style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>Sign Up</button>
      </p>
    </div>
  );
}
