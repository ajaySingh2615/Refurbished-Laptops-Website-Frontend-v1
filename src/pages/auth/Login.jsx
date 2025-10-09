import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (e) {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3 py-8">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border rounded px-3 h-10"
      />
      <input
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border rounded px-3 h-10"
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full h-10 bg-blue-600 text-white rounded">
        Login
      </button>
      <button
        type="button"
        className="w-full h-10 border rounded"
        onClick={() => (window.location.href = '/api/auth/google/start')}
      >
        Continue with Google
      </button>
    </form>
  );
}
