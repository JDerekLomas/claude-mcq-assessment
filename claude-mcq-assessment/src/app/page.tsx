'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageThread, EmptyThread, MessageLoading } from '@/components/chat/MessageThread';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { MCQCard, type MCQResponse } from '@/components/learning/MCQCard';
import { LearningModePanel } from '@/components/learning/LearningModePanel';
import type { Item } from '@/lib/mcp/schemas/item';

type ModelId = 'claude-4-opus' | 'claude-4-sonnet' | 'claude-3.5-sonnet';
type Difficulty = 'casual' | 'moderate' | 'rigorous';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mcqItem?: Item;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  isActive?: boolean;
}

// Sample MCQ item for demonstration
const sampleMCQItem: Item = {
  id: 'js-this-001',
  topic: 'js-this',
  difficulty: 'medium',
  stem: 'What will be logged to the console when this code executes?',
  code: `const obj = {
  name: 'Alice',
  greet: function() {
    const inner = () => {
      console.log(this.name);
    };
    inner();
  }
};
obj.greet();`,
  options: [
    { id: 'A', text: 'undefined' },
    { id: 'B', text: 'Alice' },
    { id: 'C', text: 'TypeError: Cannot read property \'name\' of undefined' },
    { id: 'D', text: 'An empty string' },
  ],
  correct: 'B',
  feedback: {
    correct: 'Correct! Arrow functions inherit `this` from their enclosing scope.',
    incorrect: 'Not quite. Remember that arrow functions don\'t have their own `this` binding.',
    explanation: 'Arrow functions capture `this` lexically from their surrounding scope. Since `inner` is defined inside `greet`, it inherits `this` from `greet`, which is `obj` due to the method call `obj.greet()`. Therefore, `this.name` is "Alice".',
  },
};

// Sample conversations
const sampleConversations: Conversation[] = [
  { id: '1', title: 'JavaScript closures explained', timestamp: new Date(), isActive: true },
  { id: '2', title: 'React hooks best practices', timestamp: new Date(Date.now() - 86400000) },
  { id: '3', title: 'TypeScript generics', timestamp: new Date(Date.now() - 172800000) },
];

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<ModelId>('claude-4-sonnet');
  const [learningModeEnabled, setLearningModeEnabled] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [learningStats, setLearningStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
  });

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversations((prev) =>
      prev.map((c) => ({ ...c, isActive: false }))
    );
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    );
    // In a real app, this would load the conversation messages
    setMessages([]);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: learningModeEnabled
          ? 'Great question! Let me test your understanding with a quick assessment:'
          : 'I\'d be happy to help you with that. Let me explain...',
        timestamp: new Date(),
        mcqItem: learningModeEnabled ? sampleMCQItem : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, [learningModeEnabled]);

  const handleMCQResponse = useCallback((response: MCQResponse) => {
    setLearningStats((prev) => ({
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: prev.correctAnswers + (response.is_correct ? 1 : 0),
      streak: response.is_correct ? prev.streak + 1 : 0,
    }));

    // Log response to server
    fetch('/api/log-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...response,
        session_id: 'demo-session',
      }),
    }).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen bg-surface-primary">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          learningModeEnabled={learningModeEnabled}
          onLearningModeChange={setLearningModeEnabled}
        />

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Message thread */}
          <div className="flex flex-1 flex-col min-w-0">
            {messages.length === 0 && !isLoading ? (
              <EmptyThread />
            ) : (
              <MessageThread>
                {messages.map((message) => (
                  <div key={message.id}>
                    <MessageBubble
                      role={message.role}
                      timestamp={message.timestamp}
                    >
                      <p>{message.content}</p>
                    </MessageBubble>

                    {/* MCQ Card if present */}
                    {message.mcqItem && (
                      <div className="max-w-message mx-auto px-4 py-2">
                        <MCQCard
                          item={message.mcqItem}
                          onResponse={handleMCQResponse}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && <MessageLoading />}
              </MessageThread>
            )}

            {/* Input */}
            <ChatInput
              onSubmit={handleSendMessage}
              disabled={isLoading}
              learningModeEnabled={learningModeEnabled}
            />
          </div>

          {/* Learning mode panel (sidebar) */}
          {learningModeEnabled && (
            <div className="w-72 shrink-0 border-l border-edge-light bg-surface-primary p-4 overflow-y-auto">
              <LearningModePanel
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                stats={learningStats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
