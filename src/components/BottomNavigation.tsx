import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ScanLine, BarChart3, MessageSquare, User } from 'lucide-react';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/scan', icon: ScanLine, label: 'Scan' },
  { path: '/analytics', icon: BarChart3, label: 'Stats' },
  { path: '/ai-assistant', icon: MessageSquare, label: 'AI Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="bottom-nav">
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 20,
              background: active ? 'rgba(34,197,94,0.12)' : 'transparent', border: 'none' }}>
            <Icon size={21} color={active ? '#22c55e' : '#9ca3af'} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#22c55e' : '#9ca3af' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
