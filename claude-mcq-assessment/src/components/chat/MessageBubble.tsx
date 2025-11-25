'use client';

import { type ReactNode } from 'react';

type MessageRole = 'user' | 'assistant';

interface MessageBubbleProps {
  role: MessageRole;
  children: ReactNode;
  timestamp?: Date;
  className?: string;
}

function ClaudeAvatarIcon({ className }: { className?: string }) {
  return (
    <div
      className={`
        flex items-center justify-center
        w-8 h-8
        rounded-full
        bg-claude
        ${className}
      `}
    >
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
        <path
          d="M12 8V14M12 14L9 11M12 14L15 11"
          stroke="#C15F3C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function UserAvatarIcon({ className }: { className?: string }) {
  return (
    <div
      className={`
        flex items-center justify-center
        w-8 h-8
        rounded-full
        bg-surface-tertiary
        ${className}
      `}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
          fill="#666666"
        />
        <path
          d="M8 9C5.23858 9 3 11.0147 3 13.5C3 13.7761 3.22386 14 3.5 14H12.5C12.7761 14 13 13.7761 13 13.5C13 11.0147 10.7614 9 8 9Z"
          fill="#666666"
        />
      </svg>
    </div>
  );
}

export function MessageBubble({
  role,
  children,
  timestamp,
  className = '',
}: MessageBubbleProps) {
  const isAssistant = role === 'assistant';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={`
        flex gap-4
        max-w-message w-full mx-auto
        px-4 py-4
        animate-fade-in animate-slide-up
        ${className}
      `}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-1">
        {isAssistant ? (
          <ClaudeAvatarIcon />
        ) : (
          <UserAvatarIcon />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header with role and timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-ink-primary">
            {isAssistant ? 'Claude' : 'You'}
          </span>
          {timestamp && (
            <span className="text-xs text-ink-tertiary">
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        {/* Message body */}
        <div
          className={`
            text-ink-primary text-[15px] leading-relaxed
            prose prose-sm max-w-none
            prose-p:my-2
            prose-pre:bg-surface-secondary prose-pre:border prose-pre:border-edge-light prose-pre:rounded-lg
            prose-code:text-claude prose-code:font-mono prose-code:text-sm
            prose-code:before:content-none prose-code:after:content-none
            prose-a:text-claude prose-a:no-underline hover:prose-a:underline
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
