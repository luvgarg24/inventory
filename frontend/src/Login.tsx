import React, { useState } from 'react';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey }),
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('session_token', data.token);
      onLogin();
    } else {
      setError('Invalid passkey');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: 'auto', marginTop: 100 }}>
      <h2>Enter Passkey</h2>
      <input
        type="password"
        value={passkey}
        onChange={e => setPasskey(e.target.value)}
        placeholder="Passkey"
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button type="submit" style={{ width: '100%', padding: 8 }}>Login</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}
