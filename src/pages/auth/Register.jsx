import React from 'react';
import { apiService } from '../../services/api.js';

export default function Register() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [msg, setMsg] = React.useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await apiService.register({ email, password, name });
    setMsg('Registered, please login.');
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3 py-8">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full border rounded px-3 h-10"
      />
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
      {msg && <div className="text-green-600 text-sm">{msg}</div>}
      <button type="submit" className="w-full h-10 bg-blue-600 text-white rounded">
        Create Account
      </button>
    </form>
  );
}
