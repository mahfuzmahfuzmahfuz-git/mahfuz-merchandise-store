import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading || !user) {
    return <div className="max-w-screen-xl mx-auto px-6 py-12" />;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-10 border-b border-[#e5e5e5] pb-6">
          <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-2">Account</p>
          <h1 className="font-serif text-2xl text-charcoal">My Account</h1>
        </div>

        <div className="border border-[#e5e5e5] p-8 mb-10">
          <div className="flex justify-between mb-4">
            <span className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted">Name</span>
            <span className="font-sans text-[13px] text-charcoal">{user.name}</span>
          </div>
          <div className="flex justify-between border-t border-[#e5e5e5] pt-4">
            <span className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted">Email</span>
            <span className="font-sans text-[13px] text-charcoal">{user.email}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-charcoal text-cream text-[11px] tracking-[0.25em] uppercase font-sans hover:opacity-70 transition-opacity duration-200"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
