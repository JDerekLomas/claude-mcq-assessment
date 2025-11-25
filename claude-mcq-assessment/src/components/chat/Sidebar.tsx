'use client';

import { Button } from '@/components/ui/Button';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  isActive?: boolean;
}

interface SidebarProps {
  conversations?: Conversation[];
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  className?: string;
}

function PlusIcon({ className }: { className?: string }) {
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
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
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
        d="M14 8C14 11.3137 11.3137 14 8 14C6.85279 14 5.78139 13.6835 4.86833 13.1347L2 14L2.86526 11.1317C2.31652 10.2186 2 9.14721 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
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
        d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.93 10.18C12.84 10.38 12.82 10.61 12.88 10.82L13.28 12.2C13.35 12.45 13.28 12.71 13.1 12.89L12.89 13.1C12.71 13.28 12.45 13.35 12.2 13.28L10.82 12.88C10.61 12.82 10.38 12.84 10.18 12.93C9.99 13.02 9.84 13.18 9.76 13.38L9.23 14.72C9.14 14.96 8.91 15.12 8.65 15.13H8.35C8.09 15.12 7.86 14.96 7.77 14.72L7.24 13.38C7.16 13.18 7.01 13.02 6.82 12.93C6.62 12.84 6.39 12.82 6.18 12.88L4.8 13.28C4.55 13.35 4.29 13.28 4.11 13.1L3.9 12.89C3.72 12.71 3.65 12.45 3.72 12.2L4.12 10.82C4.18 10.61 4.16 10.38 4.07 10.18C3.98 9.99 3.82 9.84 3.62 9.76L2.28 9.23C2.04 9.14 1.88 8.91 1.87 8.65V8.35C1.88 8.09 2.04 7.86 2.28 7.77L3.62 7.24C3.82 7.16 3.98 7.01 4.07 6.82C4.16 6.62 4.18 6.39 4.12 6.18L3.72 4.8C3.65 4.55 3.72 4.29 3.9 4.11L4.11 3.9C4.29 3.72 4.55 3.65 4.8 3.72L6.18 4.12C6.39 4.18 6.62 4.16 6.82 4.07C7.01 3.98 7.16 3.82 7.24 3.62L7.77 2.28C7.86 2.04 8.09 1.88 8.35 1.87H8.65C8.91 1.88 9.14 2.04 9.23 2.28L9.76 3.62C9.84 3.82 9.99 3.98 10.18 4.07C10.38 4.16 10.61 4.18 10.82 4.12L12.2 3.72C12.45 3.65 12.71 3.72 12.89 3.9L13.1 4.11C13.28 4.29 13.35 4.55 13.28 4.8L12.88 6.18C12.82 6.39 12.84 6.62 12.93 6.82C13.02 7.01 13.18 7.16 13.38 7.24L14.72 7.77C14.96 7.86 15.12 8.09 15.13 8.35V8.65C15.12 8.91 14.96 9.14 14.72 9.23L13.38 9.76C13.18 9.84 13.02 9.99 12.93 10.18Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ClaudeLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 7L12 12L22 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sidebar({
  conversations = [],
  onNewChat,
  onSelectConversation,
  className = '',
}: SidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group conversations by time period
  const groupedConversations = conversations.reduce(
    (groups, conv) => {
      const label = formatDate(conv.timestamp);
      if (!groups[label]) groups[label] = [];
      groups[label].push(conv);
      return groups;
    },
    {} as Record<string, Conversation[]>
  );

  return (
    <aside
      className={`
        flex flex-col
        w-sidebar h-screen
        bg-surface-secondary
        border-r border-edge-light
        ${className}
      `}
    >
      {/* Header with logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-edge-light">
        <div className="flex items-center gap-2">
          <ClaudeLogoIcon className="text-claude" />
          <span className="text-lg font-semibold text-ink-primary font-display">
            Claude
          </span>
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 py-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-ink-secondary"
          onClick={onNewChat}
        >
          <PlusIcon />
          New chat
        </Button>
      </div>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {Object.entries(groupedConversations).map(([label, convs]) => (
          <div key={label} className="mb-4">
            <h3 className="px-2 py-1 text-xs font-medium text-ink-tertiary uppercase tracking-wider">
              {label}
            </h3>
            <ul className="space-y-0.5">
              {convs.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => onSelectConversation?.(conv.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-2
                      rounded-lg text-left text-sm
                      transition-colors duration-150
                      ${
                        conv.isActive
                          ? 'bg-surface-tertiary text-ink-primary'
                          : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'
                      }
                    `}
                  >
                    <ChatBubbleIcon className="shrink-0 opacity-60" />
                    <span className="truncate">{conv.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-ink-tertiary">
              No conversations yet
            </p>
          </div>
        )}
      </div>

      {/* Footer with settings */}
      <div className="border-t border-edge-light px-3 py-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-ink-secondary"
        >
          <SettingsIcon />
          Settings
        </Button>
      </div>
    </aside>
  );
}
