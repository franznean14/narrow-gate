'use client';

import React from 'react';
import { Shield, Flame } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <Shield size={80} className="text-amber-500 mx-auto animate-pulse" />
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter">
            COVENANT<br/>TACTICAL
          </h1>
          <p className="text-slate-400 text-lg">Cooperative Tabletop Mode</p>
        </div>

        {/* Game Selection Buttons */}
        <div className="flex gap-8 justify-center items-center flex-wrap">
          {/* Narrow Gate Button */}
          <Link href="/narrow-gate">
            <button className="group relative w-64 h-64 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 rounded-2xl shadow-2xl border-4 border-indigo-400 hover:border-indigo-300 transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-white">
              <Shield size={64} className="mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Narrow Gate</h2>
              <p className="text-sm text-indigo-200 opacity-90">Tactical Map Game</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
          </Link>

          {/* Lampstand Button */}
          <Link href="/lampstand">
            <button className="group relative w-64 h-64 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 rounded-2xl shadow-2xl border-4 border-amber-400 hover:border-amber-300 transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-white">
              <Flame size={64} className="mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Lampstand</h2>
              <p className="text-sm text-amber-200 opacity-90">Card-Based Strategy</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
