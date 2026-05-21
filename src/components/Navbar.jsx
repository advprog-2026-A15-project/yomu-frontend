import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useTheme } from '../features/theme/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { NotificationMenu } from './NotificationMenu';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Yomu</Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '16px', background: 'var(--bg-page)', padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setTheme('light')} style={{ background: theme === 'light' ? 'var(--bg-main)' : 'transparent', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: theme === 'light' ? 'var(--primary)' : 'var(--text-light)', boxShadow: theme === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
            <Sun size={18} />
          </button>
          <button onClick={() => setTheme('dark')} style={{ background: theme === 'dark' ? 'var(--bg-main)' : 'transparent', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: theme === 'dark' ? 'var(--primary)' : 'var(--text-light)', boxShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
            <Moon size={18} />
          </button>
          <button onClick={() => setTheme('system')} style={{ background: theme === 'system' ? 'var(--bg-main)' : 'transparent', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: theme === 'system' ? 'var(--primary)' : 'var(--text-light)', boxShadow: theme === 'system' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
            <Monitor size={18} />
          </button>
        </div>

        {user && <NotificationMenu />}

        {user ? (
          <div className="nav-links">
            <Link to="/learning" className="nav-item">Belajar</Link>
            <Link to="/clan" className="nav-item">Liga</Link>
            <Link to="/liga/standings" className="nav-item">Klasemen</Link>
            <Link to="/achievements" className="nav-item">Misi</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="nav-item" style={{ color: 'var(--danger)' }}>Admin</Link>
            )}
            <div className="nav-user">
              <Link to="/profile" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Profil ({user.username})
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Keluar
              </button>
            </div>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>Masuk</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Daftar</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
