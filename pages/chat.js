import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export async function getServerSideProps(context) {
  const { user } = await supabase.auth.getUser(context.req);
  if (!user) {
    return { redirect: { destination: '/auth', permanent: false } };
  }
  return { props: { user } };
}

export default function Chat({ user }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.response || 'Error: No response from LLM');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h1>AI Chat</h1>
      <p>Welcome, {user.email}!</p>
      <button onClick={handleLogout} style={{ padding: '8px 16px', marginBottom: '20px' }}>
        Logout
      </button>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask me anything"
        style={{ display: 'block', margin: '10px auto', padding: '8px', width: '100%' }}
      />
      <button onClick={handleSubmit} style={{ padding: '8px 16px' }}>
        Submit
      </button>
      <p>{response}</p>
      <a href="/" style={{ marginTop: '20px', display: 'block', color: '#0070f3' }}>
        Back to Home
      </a>
    </div>
  );
}