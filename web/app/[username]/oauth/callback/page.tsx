'use client';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter, useSearchParams } from 'next/navigation';

const OAuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams ? searchParams.get('token') : null;
    const username = localStorage.getItem('username');

    if (token) {
      try {
        const user = jwtDecode(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        router.replace(`/${username}/calendar`);
      } catch (error) {
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router, searchParams]);

  return <p>Redirecting...</p>;
};

export default OAuthCallback;
