import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Sign-up successful! Check your email to confirm.');
    }
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Logged in! Redirecting to chat...');
      setTimeout(() => (window.location.href = '/chat'), 1000); // Redirect to /chat
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ display: 'block', margin: '10px auto', padding: '8px', width: '100%' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ display: 'block', margin: '10px auto', padding: '8px', width: '100%' }}
      />
      <button
        onClick={isLogin ? handleLogin : handleSignUp}
        style={{ padding: '8px 16px', margin: '10px' }}
      >
        {isLogin ? 'Login' : 'Sign Up'}
      </button>
      <p>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsLogin(!isLogin);
            setMessage('');
          }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </a>
      </p>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}