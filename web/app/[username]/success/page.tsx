import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OAuthSuccessPage() {
  const router = useRouter();
  console.log("🚀 ~ OAuthSuccessPage ~ router:", router)

  useEffect(() => {
    if (router.isReady) {
      const { access_token, refresh_token, username } = router.query;

      if (
        typeof access_token === 'string' &&
        typeof refresh_token === 'string' &&
        typeof username === 'string'
      ) {
        // Save to localStorage
        localStorage.setItem('google_access_token', access_token);
        localStorage.setItem('google_refresh_token', refresh_token);
        localStorage.setItem('username', username);

        console.log('✅ Tokens saved to localStorage');
        router.push(`/${username}/calendar`);
      } else {
        console.error('❌ Missing tokens in URL');
      }
    }
  }, [router.isReady, router.query]);

  return <p>Processing Google login...</p>;
}