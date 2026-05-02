import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      addToast('Account created successfully!', 'success');
      login(data.token, data.user);
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍿</span>
          <h1 className="text-3xl font-bold text-white mt-3">Join PopcornScore</h1>
          <p className="text-ps-muted mt-2">Rate movies, build your watchlist, share reviews</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ps-text mb-1.5">Username</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ps-text mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ps-text mb-1.5">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ps-text mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ps-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ps-red hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
