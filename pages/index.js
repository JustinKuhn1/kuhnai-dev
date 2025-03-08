import { supabase } from '../lib/supabaseClient';

export async function getServerSideProps(context) {
  const { user } = await supabase.auth.getUser(context.req);
  return { props: { user: user || null } }; // Pass user if logged in, null if not
}

export default function Home({ user }) {
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Welcome to My AI App</h1>
      <p>A personal project for me and my friends.</p>
      {user ? (
        <div>
          <p>Hello, {user.email}!</p>
          <a href="/chat" style={{ margin: '10px', padding: '8px 16px', background: '#0070f3', color: 'white', textDecoration: 'none' }}>
            Go to Chat
          </a>
          <br />
          <a href="/auth" style={{ margin: '10px', color: '#0070f3' }}>
            Logout or Switch Account
          </a>
        </div>
      ) : (
        <div>
          <p>Please log in to use the AI chat.</p>
          <a href="/auth" style={{ margin: '10px', padding: '8px 16px', background: '#0070f3', color: 'white', textDecoration: 'none' }}>
            Login / Sign Up
          </a>
        </div>
      )}
    </div>
  );
}