import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { api } from '../utils/api';

const PENDING_KEY = 'pending_coords';

// Username: max 30 chars
// Password: min 5 chars, at least 1 uppercase, 1 lowercase, 1 special char

const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{5,}$/;

export default function Auth() {
  const { user, setUsername, setGuest } = useContext(UserContext);
  const navigate = useNavigate();

  const [nameInput, setNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setNameInput(e.target.value);
    setError('');
  };

  const handlePwdChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const validateInputs = (username, pwd) => {
    if (!username) return 'Introdu un nume de utilizator.';
    if (username.length > 30) return 'Numele are maxim 30 de caractere.';
    if (username.toLowerCase() === 'guest') return "Numele 'guest' este rezervat.";
    if (!pwd) return 'Introdu o parola.';
    if (!pwdRegex.test(pwd)) return 'Parola trebuie sa aiba minim 5 caractere, cel puțin o litera mare, o litera mica si un caracter special.';
    return null;
  };

  const createUserOnServer = async (username, pwd) => {
    return api.post('/signup', { username, password: pwd });
  };

  const signInOnServer = async (username, pwd) => {
    return api.post('/signin', { username, password: pwd });
  };

  const flushPendingCoordsToServer = async (username) => {
    if (!username || username === 'guest') return;
    let pending = [];
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || '[]');
      sessionStorage.removeItem(PENDING_KEY);
    } catch (e) {
      pending = [];
    }

    for (const p of pending) {
      try {
        await api.post(`/users/${username}/coords`, p);
      } catch (err) {
        console.warn('Failed to flush pending coord', p, err);
        try {
          const cur = JSON.parse(sessionStorage.getItem(PENDING_KEY) || '[]');
          cur.push(p);
          sessionStorage.setItem(PENDING_KEY, JSON.stringify(cur));
        } catch (e) {
          console.warn('Could not restore pending coord to sessionStorage');
        }
      }
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    const username = nameInput.trim();
    const err = validateInputs(username, password);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createUserOnServer(username, password);
      setUsername(username);
      await flushPendingCoordsToServer(username);
      //alert(`Cont creat si autentificat ca: ${username}`);
      setNameInput('');
      setPassword('');
      navigate('/');
    } catch (err) {
      console.error('Signup error', err);
      const msg = err?.response?.data?.detail || err.message || 'Eroare la server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    const username = nameInput.trim();
    if (!username) {
      setError('Introdu un nume de utilizator.');
      return;
    }
    if (!password) {
      setError('Introdu o parola.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signInOnServer(username, password);
      setUsername(username);
      await flushPendingCoordsToServer(username);
      //alert(`Autentificat ca: ${username}`);
      setNameInput('');
      setPassword('');
      navigate('/');
    } catch (err) {
      console.error('Signin error', err);
      const msg = err?.response?.data?.detail || err.message || 'Eroare la autentificare.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest();
    navigate('/');
  };

  return (
    <div style={{ padding: 20, maxWidth: 560, margin: '2rem auto', background: '#f6f7fb', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>Autentificare</h2>

      <form style={{ display: 'grid', gap: 8 }} onSubmit={(e) => e.preventDefault()}>
        <input
          value={nameInput}
          onChange={handleChange}
          placeholder="Username"
          aria-label="username"
          style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: 6, border: '1px solid #ddd' }}
          disabled={loading}
        />

        <input
          value={password}
          onChange={handlePwdChange}
          placeholder="Password"
          type="password"
          aria-label="password"
          style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: 6, border: '1px solid #ddd' }}
          disabled={loading}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSignIn} style={{ flex: 1, padding: '0.6rem', borderRadius: 6, border: 'none', background: '#28a745', color: 'white', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Se proceseaza...' : 'Sign In'}
          </button>

          <button onClick={handleSignUp} style={{ flex: 1, padding: '0.6rem', borderRadius: 6, border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Se proceseaza...' : 'Sign Up'}
          </button>
        </div>

        <button type="button" onClick={handleGuest} style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
          Continue as Guest
        </button>

        {error && (
          <div style={{ padding: '0.6rem', background: '#ffecec', border: '1px solid #f5c2c2', borderRadius: 6, color: '#a33' }}>{error}</div>
        )}

        <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#666' }}>
          Currently: <strong>{user?.username ?? 'not set'}</strong>
        </div>
      </form>
    </div>
  );
}
