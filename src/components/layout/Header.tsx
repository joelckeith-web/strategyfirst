'use client';

import Link from 'next/link';
import { APP_NAME, COMPANY_NAME } from '@/lib/constants';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-[#002366] sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10"
              onClick={onMenuToggle}
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            <Link href="/" className="flex items-center ml-4 lg:ml-0">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-br from-[#4CC9F0] to-[#9F4CFF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SF</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-white">{APP_NAME}</h1>
                <p className="text-xs text-[#4CC9F0]">{COMPANY_NAME}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/research"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#4CC9F0] to-[#9F4CFF] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Research
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
