'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  learningModeEnabled?: boolean;
  className?: string;
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 7.5L7.5 13.5C6.11929 14.8807 3.88071 14.8807 2.5 13.5C1.11929 12.1193 1.11929 9.88071 2.5 8.5L9.5 1.5C10.3284 0.671573 11.6716 0.671573 12.5 1.5C13.3284 2.32843 13.3284 3.67157 12.5 4.5L5.5 11.5C5.08579 11.9142 4.41421 11.9142 4 11.5C3.58579 11.0858 3.58579 10.4142 4 10L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="10" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = 'Message Claude...',
  learningModeEnabled = false,
  className = '',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSubmit?.(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = message.trim().length > 0 && !disabled;

  return (
    <div
      className={`
        border-t border-edge-light
        bg-surface-primary
        px-4 py-4
        ${className}
      `}
    >
      <form
        onSubmit={handleSubmit}
        className={`
          relative
          max-w-message mx-auto
          ${learningModeEnabled ? 'ring-2 ring-claude/20 rounded-claude' : ''}
        `}
      >
        {/* Learning mode indicator */}
        {learningModeEnabled && (
          <div className="absolute -top-6 left-0 flex items-center gap-1.5 text-xs text-claude">
            <span className="w-1.5 h-1.5 rounded-full bg-claude animate-pulse" />
            Learning Mode active
          </div>
        )}

        {/* Input container */}
        <div
          className={`
            flex items-end gap-2
            bg-surface-secondary
            border border-edge-light
            rounded-claude
            px-4 py-3
            focus-within:border-edge-dark
            transition-colors duration-150
            ${learningModeEnabled ? 'border-claude/30' : ''}
          `}
        >
          {/* File attachment button */}
          <button
            type="button"
            className="
              shrink-0
              p-1.5
              text-ink-tertiary
              hover:text-ink-secondary
              transition-colors duration-150
            "
            aria-label="Attach file"
          >
            <PaperclipIcon />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              flex-1
              bg-transparent
              text-ink-primary text-[15px]
              placeholder:text-ink-tertiary
              resize-none
              outline-none
              max-h-[200px]
              leading-normal
              py-1
            "
          />

          {/* Submit button */}
          {disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 w-8 h-8 text-ink-secondary hover:text-ink-primary"
              aria-label="Stop generating"
            >
              <StopIcon />
            </Button>
          ) : (
            <Button
              type="submit"
              variant={canSubmit ? 'primary' : 'ghost'}
              size="icon"
              disabled={!canSubmit}
              className={`
                shrink-0 w-8 h-8
                ${!canSubmit ? 'text-ink-tertiary' : ''}
              `}
              aria-label="Send message"
            >
              <SendIcon />
            </Button>
          )}
        </div>

        {/* Footer text */}
        <p className="mt-2 text-center text-xs text-ink-tertiary">
          Claude can make mistakes. Please double-check responses.
        </p>
      </form>
    </div>
  );
}
