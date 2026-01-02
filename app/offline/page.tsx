'use client';

import { Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl mb-4">📴</div>
        <h1 className="text-4xl font-black text-white uppercase">You're Offline</h1>
        <p className="text-slate-400">
          This app works offline, but you need to be online to start a new game or sync data.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
          >
            <RefreshCcw size={20} /> Retry
          </button>
          <Link href="/">
            <button className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-xl">
              <Home size={20} /> Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

