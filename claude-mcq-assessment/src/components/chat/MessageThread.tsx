'use client';

import { useRef, useEffect, type ReactNode } from 'react';

interface MessageThreadProps {
  children: ReactNode;
  className?: string;
  autoScroll?: boolean;
}

export function MessageThread({
  children,
  className = '',
  autoScroll = true,
}: MessageThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [children, autoScroll]);

  return (
    <div
      ref={threadRef}
      className={`
        flex-1 overflow-y-auto
        bg-surface-primary
        ${className}
      `}
    >
      {/* Messages container with max width constraint */}
      <div className="min-h-full flex flex-col">
        {/* Spacer to push content down when few messages */}
        <div className="flex-1" />

        {/* Messages */}
        <div className="py-4">
          {children}
        </div>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// Loading indicator for streaming responses
export function MessageLoading() {
  return (
    <div className="flex gap-4 max-w-message w-full mx-auto px-4 py-4">
      {/* Claude avatar placeholder */}
      <div className="shrink-0 pt-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-claude">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Loading animation */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-ink-primary">Claude</span>
        </div>
        <div className="flex items-center gap-1.5 py-2">
          <span className="w-2 h-2 rounded-full bg-ink-tertiary animate-pulse-subtle" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-ink-tertiary animate-pulse-subtle" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full bg-ink-tertiary animate-pulse-subtle" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}

// Empty state when no messages
export function EmptyThread() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      {/* Claude logo */}
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-claude/10 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-claude"
          >
            <path
              d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <path
              d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-ink-primary mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-ink-secondary text-center max-w-md">
        Ask me anything about code, writing, analysis, math, or any topic you&apos;d like to explore.
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mt-8 max-w-lg justify-center">
        {[
          'Explain React hooks',
          'Debug my code',
          'Write a function',
          'Analyze this data',
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="
              px-4 py-2
              text-sm text-ink-secondary
              bg-surface-secondary
              border border-edge-light
              rounded-full
              hover:bg-surface-tertiary hover:text-ink-primary
              transition-colors duration-150
            "
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
