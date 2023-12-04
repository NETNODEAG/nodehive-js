// AuthWrapper.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { NodeHiveClient } from 'nodehive-js';


export function AuthWrapper({ children }) {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const client = new NodeHiveClient(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL
  );

  useEffect(() => {
    setUserLoggedIn(client.isLoggedIn());
  }, []);

  if (!userLoggedIn) {
    return null;
  }

  return (<>{children}</>);
}

