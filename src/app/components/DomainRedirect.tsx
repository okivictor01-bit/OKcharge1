'use client';
import { useEffect } from 'react';

// Anyone arriving on an old address is sent to the real one, keeping the path and
// the ?location= code, so QR codes printed with the old address keep working and
// the login is never split across two addresses.
const CANONICAL_HOST = 'okcharge.site';
const REDIRECT_FROM = ['okcharge1.pages.dev', 'www.okcharge.site'];

export default function DomainRedirect() {
  useEffect(() => {
    const { hostname, pathname, search, hash } = window.location;
    if (REDIRECT_FROM.includes(hostname)) {
      window.location.replace(`https://${CANONICAL_HOST}${pathname}${search}${hash}`);
    }
  }, []);

  return null;
}
