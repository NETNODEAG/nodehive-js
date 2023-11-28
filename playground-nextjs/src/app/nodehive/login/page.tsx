// LoginPage.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { NodeHiveClient } from 'nodehive-js';
import LoginForm from '@/components/NodeHive/LoginForm';


// Ensure correct path

export default function LoginPage() {
  return (
    <LoginForm></LoginForm>
    )
}
