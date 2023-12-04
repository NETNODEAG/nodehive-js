'use client';

import { useEffect, useState } from 'react';
import { NodeHiveClient } from '../../NodeHiveClient';

export function LoginForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [cookieData, setCookieData] = useState({});

  const client = new NodeHiveClient(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    ''
  );

  useEffect(() => {
    async function checkSession() {
      const result = await client.hasValidSession();
      setIsLoggedIn(result);
      setLoading(false);
    }

    checkSession();
    updateData();
  }, []);

  function updateData() {
    const cookieData = client.getAllCookieData();
    setCookieData(cookieData);
  }

  async function loginUser(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email').toString();
    const password = formData.get('password').toString();

    if (email && password) {
      try {
        await client.login(email, password);
        setIsLoggedIn(true);
        window.location.href = '/';
      } catch (error) {
        console.log(error);
        setError('Login failed. Please check your credentials.');
        setIsLoggedIn(false);
      }
    }
  }

  async function handleLogout() {
    client.logout();
    setIsLoggedIn(false);
  }

  if (loading) {
    return (
      <div className="container-wrapper">
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex flex-col bg-gray-50 py-20">
        <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <h1 className="text-md mb-4 font-bold tracking-tight text-zinc-800">
              You are already logged in!
            </h1>
            <details open>
              <summary>User Data</summary>
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </details>
            <details open>
              <summary>Cookie Data</summary>
              <pre>{JSON.stringify(cookieData, null, 2)}</pre>
            </details>
            <button
              onClick={handleLogout}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 py-20">
      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-zinc-800 sm:text-5xl">
            Login
          </h1>

          <form onSubmit={loginUser} className="mt-4 space-y-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address / Username
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="email"
                placeholder="Email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Login
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </form>

          <details className="mt-10">
            <summary>User Data</summary>
            <pre className="rounded-md bg-black p-8 text-xs text-slate-50">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </details>
          <pre></pre>
        </div>
      </div>
    </div>
  );
}
