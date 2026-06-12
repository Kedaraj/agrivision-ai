import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, Loader2, Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SignUpScreen() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) { setError('Name, email and password are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), phone, password });
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px 14px 46px',
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: 16, fontSize: 15, color: '#111827',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 24px 48px', background: '#fff' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 28px rgba(34,197,94,0.35)' }}>
          <Leaf size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Create Account 🌱</h1>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Join thousands of smart farmers</p>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', borderRadius: 28, padding: 22, border: '1.5px solid #f3f4f6', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', marginBottom: 18 }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, marginBottom: 16 }}>
            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {/* Full Name */}
          <div style={{ position: 'relative' }}>
            <User size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" style={inp} />
          </div>

          {/* Phone */}
          <div style={{ position: 'relative' }}>
            <Phone size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="tel" placeholder="Mobile Number (optional)" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" style={inp} />
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" style={inp} />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password (minimum 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ ...inp, paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={17} color="#9ca3af" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              style={{ ...inp, paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button onClick={handleSignup} disabled={loading}
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#22c55e,#34d399)', color: '#fff', borderRadius: 20, fontWeight: 700, fontSize: 16, boxShadow: '0 4px 20px rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Creating Account...</> : '✨  Create Account'}
        </button>
      </div>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>Sign In</button>
      </p>
    </div>
  );
}
