import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => {
        setProfile(data);
        setForm((f) => ({ ...f, username: data.username, email: data.email }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (form.password && form.password !== form.confirm)
      return setError('Passwords do not match.');

    const payload = {};
    if (form.username !== profile.username) payload.username = form.username;
    if (form.email    !== profile.email)    payload.email    = form.email;
    if (form.password)                      payload.password = form.password;
    if (Object.keys(payload).length === 0)  return setMessage('Nothing changed.');

    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', payload);
      setProfile((p) => ({ ...p, ...data }));
      updateUser(data);
      setForm((f) => ({ ...f, password: '', confirm: '' }));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🍿</div>
      </div>
    );
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-ps-red flex items-center justify-center text-3xl font-bold text-white">
          {initials}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{profile?.username}</h1>
          <p className="text-ps-muted">{profile?.email}</p>
        </div>
      </div>

      {/* Stats */}
      {profile?.stats && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-ps-red">{profile.stats.total_ratings}</p>
            <p className="text-sm text-ps-muted mt-1">Movies Rated</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-ps-gold">{profile.stats.wishlist_count}</p>
            <p className="text-sm text-ps-muted mt-1">Watchlist</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-white">
              {parseFloat(profile.stats.avg_given_rating).toFixed(1)}
            </p>
            <p className="text-sm text-ps-muted mt-1">Avg Rating</p>
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
        {error   && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}
        {message && <div className="bg-green-900/30 border border-green-800 text-green-300 text-sm rounded-lg px-4 py-3 mb-5">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ps-text mb-1.5">Username</label>
            <input
              type="text"
              className="input-field"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ps-text mb-1.5">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <hr className="border-ps-border" />
          <div>
            <label className="block text-sm font-medium text-ps-text mb-1.5">New Password <span className="text-ps-muted font-normal">(leave blank to keep current)</span></label>
            <input
              type="password"
              className="input-field"
              placeholder="New password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ps-text mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
