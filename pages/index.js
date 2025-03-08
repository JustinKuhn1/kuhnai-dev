// pages/index.js
import { supabase } from '../lib/supabaseClient';

export async function getServerSideProps(context) {
  const { user } = await supabase.auth.getUser(context.req);
  if (!user) {
    return { redirect: { destination: '/auth', permanent: false } };
  }
  return { props: {} };
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask me anything"
      />
      <button onClick={handleSubmit}>Submit</button>
      <p>{response}</p>
    </div>
  );
}