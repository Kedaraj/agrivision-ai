// AgriVision AI — App Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { getToken } from './lib/auth';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ScanScreen } from './screens/ScanScreen';
import { ResultScreen } from './screens/ResultScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { AIAssistantScreen } from './screens/AIAssistantScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationScreen } from './screens/NotificationScreen';
import { FarmManagementScreen } from './screens/FarmManagementScreen';
import { MarketScreen } from './screens/MarketScreen';

function Protected({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-shell">
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#fff',
        overflowX: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MobileShell>
          <Routes>
            <Route path="/" element={<Navigate to={getToken() ? '/home' : '/login'} replace />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/home" element={<Protected><HomeScreen /></Protected>} />
            <Route path="/scan" element={<Protected><ScanScreen /></Protected>} />
            <Route path="/result" element={<Protected><ResultScreen /></Protected>} />
            <Route path="/analytics" element={<Protected><AnalyticsScreen /></Protected>} />
            <Route path="/ai-assistant" element={<Protected><AIAssistantScreen /></Protected>} />
            <Route path="/profile" element={<Protected><ProfileScreen /></Protected>} />
            <Route path="/notifications" element={<Protected><NotificationScreen /></Protected>} />
            <Route path="/farms" element={<Protected><FarmManagementScreen /></Protected>} />
            <Route path="/market" element={<Protected><MarketScreen /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
