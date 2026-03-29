// src/utils/revalidate.js

export async function revalidateNextJs({ type, slug, courseSlug }) {
    const url = process.env.NEXTJS_REVALIDATION_URL;
    const secret = process.env.NEXTJS_REVALIDATION_SECRET;
  
    if (!url || !secret) {
      console.warn('Revalidation config missing — skipping');
      return;
    }
  
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, type, slug, courseSlug }),
      });
  
      const data = await res.json();
      console.log('Revalidation response:', data);
    } catch (err) {
      // never crash the mutation if revalidation fails
      console.error('Revalidation failed:', err.message);
    }
  }