'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, FileText, ArrowRight } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const isDemo = pathname === '/demo';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-edge-light">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-claude flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L12 22M2 12L22 12M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold text-ink-primary group-hover:text-claude transition-colors">
            MCQMCP
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/#how-it-works"
            className="text-sm text-ink-secondary hover:text-ink-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#for-developers"
            className="text-sm text-ink-secondary hover:text-ink-primary transition-colors"
          >
            For Developers
          </Link>
          <Link
            href="/#for-learning-engineers"
            className="text-sm text-ink-secondary hover:text-ink-primary transition-colors"
          >
            For Learning Engineers
          </Link>
          <a
            href="https://github.com/JDerekLomas/claude-mcq-assessment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1.5"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {isDemo ? (
            <Link
              href="/"
              className="text-sm text-ink-secondary hover:text-ink-primary transition-colors"
            >
              ← Back to Home
            </Link>
          ) : (
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-claude text-white text-sm font-medium rounded-full hover:bg-claude/90 transition-colors"
            >
              Try Demo
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
