"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="appShell">
      <div className="errorState">
        <h2>Something went wrong</h2>
        <p>The account queue could not be loaded. Check the console for details.</p>
        <button onClick={reset} className="primaryButton" type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
