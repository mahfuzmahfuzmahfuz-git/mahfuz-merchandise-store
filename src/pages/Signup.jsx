import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border-b border-[#e5e5e5] bg-transparent py-3 text-[13px] font-sans text-charcoal placeholder-muted focus:outline-none focus:border-charcoal transition-colors duration-200";
  const labelClass = "block text-[11px] tracking-[0.15em] uppercase font-sans text-muted mb-2";

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-10 border-b border-[#e5e5e5] pb-6">
          <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-2">Account</p>
          <h1 className="font-serif text-2xl text-charcoal">Create an Account</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className={labelClass}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className={inputClass}
            />
          </div>

          <div className="mb-8">
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className={inputClass}
            />
          </div>

          <div className="mb-8">
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-[12px] font-sans text-red-700 mb-8">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-charcoal text-cream text-[11px] tracking-[0.25em] uppercase font-sans hover:opacity-70 transition-opacity duration-200 disabled:opacity-40"
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-[12px] font-sans text-muted text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-charcoal border-b border-charcoal pb-0.5 hover:opacity-40 transition-opacity duration-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
