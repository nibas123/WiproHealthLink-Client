
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client-side only component that will listen for permission errors
// and throw them to be caught by the Next.js development error overlay.
// It will not be included in production builds.
export function FirebaseErrorListener() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleError = (error: Error) => {
        // Throwing the error here will cause it to be displayed in the Next.js
        // development error overlay, which is exactly what we want for debugging.
        throw error;
      };

      errorEmitter.on('permission-error', handleError);
    }
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
