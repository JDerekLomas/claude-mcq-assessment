'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageThread, EmptyThread, MessageLoading } from '@/components/chat/MessageThread';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { MCQCard, type MCQResponse } from '@/components/learning/MCQCard';
import { LearningModePanel } from '@/components/learning/LearningModePanel';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { TabBar } from '@/components/tabs/TabBar';
import { ResearchTabContent } from '@/components/tabs/ResearchTabContent';
import { ResearchLinkButton } from '@/components/tabs/ResearchLinkButton';
import type { Item } from '@/lib/mcp/schemas/item';
import type { Artifact } from '@/lib/artifacts/schemas';
import type { ResearchTab, ResearchLink } from '@/lib/tabs/schemas';
import { parseMcqBlocks } from '@/lib/parse-mcq';
import { parseArtifactBlocks } from '@/lib/artifacts/parse-artifacts';
import { parseResearchLinks } from '@/lib/tabs/parse-research-links';
import { useUserContext } from '@/lib/hooks/useUserContext';
import type { StoredConversation, StoredMessage } from '@/lib/storage/schemas';

type ModelId = 'claude-4-opus' | 'claude-4-sonnet' | 'claude-3.5-sonnet';
type Difficulty = 'casual' | 'moderate' | 'rigorous';

// Component to render message content with clickable research links
interface MessageContentProps {
  content: string;
  researchLinks?: ResearchLink[];
  onOpenResearchTab: (link: ResearchLink) => void;
}

function MessageContent({ content, researchLinks, onOpenResearchTab }: MessageContentProps) {
  if (!researchLinks || researchLinks.length === 0) {
    return <MarkdownRenderer content={content} />;
  }

  // Split content by research link placeholders and render with buttons
  const parts = content.split(/\[\[RESEARCH_LINK:(\d+)\]\]/);

  return (
    <span>
      {parts.map((part, index) => {
        // Even indices are text, odd indices are link indices
        if (index % 2 === 0) {
          return <MarkdownRenderer key={index} content={part} />;
        } else {
          const linkIndex = parseInt(part, 10);
          const link = researchLinks[linkIndex];
          if (link) {
            return (
              <ResearchLinkButton
                key={index}
                link={link}
                onClick={onOpenResearchTab}
              />
            );
          }
          return null;
        }
      })}
    </span>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mcqItem?: Item;
  artifacts?: Artifact[];
  researchLinks?: ResearchLink[];
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  isActive?: boolean;
}

export default function Home() {
  // Persistent user context
  const {
    sessionId,
    context,
    isLoading: contextLoading,
    saveConversation,
    updateLearnerProfile,
    setCurrentConversation,
    setLearningMode: persistLearningMode,
  } = useUserContext();

  const [selectedModel, setSelectedModel] = useState<ModelId>('claude-4-sonnet');
  const [learningModeEnabled, setLearningModeEnabled] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [learningStats, setLearningStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [researchTabs, setResearchTabs] = useState<ResearchTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const lastMcqItemRef = useRef<Item | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Load state from persisted context when it becomes available
  useEffect(() => {
    if (context) {
      // Restore conversations
      const restoredConversations: Conversation[] = context.conversations.map(c => ({
        id: c.id,
        title: c.title,
        timestamp: new Date(c.timestamp),
        isActive: c.id === context.currentConversationId,
      }));
      setConversations(restoredConversations);
      setCurrentConversationId(context.currentConversationId);
      setLearningModeEnabled(context.learningModeEnabled);

      // Restore learning stats from profile
      setLearningStats({
        questionsAnswered: context.learnerProfile.totalQuestionsAnswered,
        correctAnswers: context.learnerProfile.totalCorrect,
        streak: context.learnerProfile.currentStreak,
      });

      // If there's an active conversation, load its messages
      if (context.currentConversationId) {
        const activeConv = context.conversations.find(c => c.id === context.currentConversationId);
        if (activeConv) {
          const restoredMessages: Message[] = activeConv.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(restoredMessages);
        }
      }
    }
  }, [context]);

  // Auto-focus chat input on page click (outside of interactive elements)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't focus if clicking on buttons, inputs, or interactive elements
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('a')
      ) {
        return;
      }
      chatInputRef.current?.focus();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Generate a 50-word summary of the conversation context
  const generateContextSummary = useCallback((): string => {
    if (messages.length === 0) return 'New conversation with no prior context.';

    // Get last few messages for context
    const recentMessages = messages.slice(-6);
    const contextText = recentMessages
      .map(m => `${m.role}: ${m.content.slice(0, 200)}`)
      .join(' ');

    // Truncate to roughly 50 words
    const words = contextText.split(/\s+/).slice(0, 50);
    return words.join(' ') + (words.length >= 50 ? '...' : '');
  }, [messages]);

  // Open a research tab for a link
  const handleOpenResearchTab = useCallback((link: ResearchLink) => {
    const existingTab = researchTabs.find(t => t.term === link.term);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: ResearchTab = {
      id: crypto.randomUUID(),
      term: link.term,
      displayName: link.display,
      contextSummary: generateContextSummary(),
      url: link.url,
      createdAt: new Date().toISOString(),
    };

    setResearchTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [researchTabs, generateContextSummary]);

  // Close a research tab
  const handleCloseResearchTab = useCallback((tabId: string) => {
    setResearchTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(null);
    }
  }, [activeTabId]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setConversations((prev) =>
      prev.map((c) => ({ ...c, isActive: false }))
    );
    lastMcqItemRef.current = null;
    setLearningModeEnabled(false);
    setResearchTabs([]);
    setActiveTabId(null);
    // Persist
    setCurrentConversation(null);
    persistLearningMode(false);
  }, [setCurrentConversation, persistLearningMode]);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    setConversations((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    );
    lastMcqItemRef.current = null;

    // Load messages from context
    if (context) {
      const conv = context.conversations.find(c => c.id === id);
      if (conv) {
        const restoredMessages: Message[] = conv.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restoredMessages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }

    // Persist
    setCurrentConversation(id);
  }, [context, setCurrentConversation]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for streaming message
    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      // Build messages array for API
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  fullContent += data.content;
                  // Update the streaming message
                  setMessages((prev) => prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent }
                      : m
                  ));
                } else if (data.type === 'done') {
                  // Parse MCQ blocks from final content
                  const { textSegments: mcqTextSegments, items } = parseMcqBlocks(fullContent);
                  const mcqText = mcqTextSegments.join('\n\n');
                  const mcqItem = items.length > 0 ? items[0] : undefined;

                  // Parse artifact blocks from the text (after MCQ parsing)
                  const { textSegments: artifactTextSegments, artifacts } = parseArtifactBlocks(mcqText);
                  const artifactText = artifactTextSegments.join('\n\n');

                  // Parse research links from the text
                  const { textSegments: researchTextSegments, links: researchLinks } = parseResearchLinks(artifactText);
                  const text = researchTextSegments.join('');

                  // Store last MCQ item for context
                  if (mcqItem) {
                    lastMcqItemRef.current = mcqItem;

                    // Log generated items (those starting with "generated-")
                    if (mcqItem.id.startsWith('generated-')) {
                      fetch('/api/log-response', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'generated_item',
                          item: mcqItem,
                          timestamp: new Date().toISOString(),
                          session_id: sessionId,
                        }),
                      }).catch(console.error);
                    }
                  }

                  // Final update with parsed content including artifacts and research links
                  setMessages((prev) => prev.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content: text,
                          mcqItem,
                          artifacts: artifacts.length > 0 ? artifacts : undefined,
                          researchLinks: researchLinks.length > 0 ? researchLinks : undefined,
                          isStreaming: false
                        }
                      : m
                  ));

                  // Create conversation with title from first assistant response
                  if (!currentConversationId) {
                    // Clean the text for title (remove link placeholders and get first meaningful line)
                    const cleanText = text.replace(/\[\[RESEARCH_LINK:\d+\]\]/g, '').trim();
                    const firstLine = cleanText.split('\n').find(line => line.trim().length > 0) || '';
                    const conversationTitle = firstLine.slice(0, 60).trim() || 'New chat';
                    const newConvId = crypto.randomUUID();
                    const now = new Date();
                    setCurrentConversationId(newConvId);
                    setConversations((prev) => [
                      { id: newConvId, title: conversationTitle, timestamp: now, isActive: true },
                      ...prev.map((c) => ({ ...c, isActive: false })),
                    ]);

                    // Persist the new conversation with messages
                    const storedMessages: StoredMessage[] = [
                      ...messages.map(m => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp.toISOString(),
                      })),
                      {
                        id: userMessage.id,
                        role: userMessage.role,
                        content: userMessage.content,
                        timestamp: userMessage.timestamp.toISOString(),
                      },
                      {
                        id: assistantMessageId,
                        role: 'assistant' as const,
                        content: text,
                        timestamp: now.toISOString(),
                        mcqItemId: mcqItem?.id,
                      },
                    ];

                    const storedConv: StoredConversation = {
                      id: newConvId,
                      title: conversationTitle,
                      timestamp: now.toISOString(),
                      messages: storedMessages,
                    };
                    saveConversation(storedConv);
                    setCurrentConversation(newConvId);
                  } else {
                    // Update existing conversation with new messages
                    const now = new Date();
                    const storedMessages: StoredMessage[] = [
                      ...messages.map(m => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp.toISOString(),
                      })),
                      {
                        id: userMessage.id,
                        role: userMessage.role,
                        content: userMessage.content,
                        timestamp: userMessage.timestamp.toISOString(),
                      },
                      {
                        id: assistantMessageId,
                        role: 'assistant' as const,
                        content: text,
                        timestamp: now.toISOString(),
                        mcqItemId: mcqItem?.id,
                      },
                    ];

                    const existingConv = conversations.find(c => c.id === currentConversationId);
                    if (existingConv) {
                      const storedConv: StoredConversation = {
                        id: currentConversationId,
                        title: existingConv.title,
                        timestamp: existingConv.timestamp.toISOString(),
                        messages: storedMessages,
                      };
                      saveConversation(storedConv);
                    }
                  }
                }
              } catch {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.map((m) =>
        m.id === assistantMessageId
          ? { ...m, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, currentConversationId, conversations, saveConversation, setCurrentConversation]);

  // Handle Learning Mode toggle from empty state
  const handleLearningModeToggle = useCallback((enabled: boolean) => {
    setLearningModeEnabled(enabled);
    persistLearningMode(enabled);
    // Don't start conversation on toggle - wait for topic selection
  }, [persistLearningMode]);

  // Handle topic selection from empty state
  const handleSelectTopic = useCallback((topicId: string) => {
    // Map topic IDs to friendly names
    const topicNames: Record<string, string> = {
      javascript: 'JavaScript',
      react: 'React',
      'html-css': 'HTML & CSS',
      typescript: 'TypeScript',
      explore: 'something specific',
    };
    const topicName = topicNames[topicId] || topicId;

    if (topicId === 'explore') {
      // Let user type what they want to learn
      handleSendMessage("[Learning Mode activated] I'd like to learn about something specific. Can you ask me what topic interests me?");
    } else {
      // Start with selected topic
      handleSendMessage(`[Learning Mode activated] I'd like to learn about ${topicName}. Can you start by asking about my current understanding and goals?`);
    }
  }, [handleSendMessage]);

  const handleMCQResponse = useCallback(async (response: MCQResponse) => {
    // Update stats
    const newStats = {
      questionsAnswered: learningStats.questionsAnswered + 1,
      correctAnswers: learningStats.correctAnswers + (response.is_correct ? 1 : 0),
      streak: response.is_correct ? learningStats.streak + 1 : 0,
    };
    setLearningStats(newStats);

    // Persist updated learning profile
    updateLearnerProfile({
      totalQuestionsAnswered: newStats.questionsAnswered,
      totalCorrect: newStats.correctAnswers,
      currentStreak: newStats.streak,
      longestStreak: Math.max(context?.learnerProfile.longestStreak || 0, newStats.streak),
    });

    // Log response to server
    try {
      await fetch('/api/log-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...response,
          session_id: sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to log response:', error);
    }

    // Send the answer to continue the conversation
    const lastItem = lastMcqItemRef.current;
    if (lastItem) {
      const answerText = `I chose ${response.selected}`;

      // Add user's answer as a message
      const userAnswerMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: answerText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userAnswerMessage]);
      setIsLoading(true);

      // Create placeholder for streaming response
      const assistantMessageId = crypto.randomUUID();
      setMessages((prev) => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }]);

      try {
        // Build messages with full context about the question and answer
        const selectedOption = lastItem.options.find(o => o.id === response.selected);
        const correctOption = lastItem.options.find(o => o.id === response.correct);

        const contextMessage = response.is_correct
          ? `[System context: The user answered "${response.selected}: ${selectedOption?.text}" which is CORRECT for the question "${lastItem.stem}". Use the explanation: "${lastItem.feedback.explanation}" to reinforce why this is correct, then continue to the next question.]`
          : `[System context: The user answered "${response.selected}: ${selectedOption?.text}" which is INCORRECT for the question "${lastItem.stem}". The correct answer was "${response.correct}: ${correctOption?.text}". Use the explanation: "${lastItem.feedback.explanation}" to help them understand, then continue to the next question.]`;

        const apiMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: answerText },
          { role: 'user' as const, content: contextMessage },
        ];

        const fetchResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (fetchResponse.ok) {
          const reader = fetchResponse.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'text') {
                      fullContent += data.content;
                      setMessages((prev) => prev.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: fullContent }
                          : m
                      ));
                    } else if (data.type === 'done') {
                      const { textSegments: mcqTextSegments, items } = parseMcqBlocks(fullContent);
                      const mcqText = mcqTextSegments.join('\n\n');
                      const mcqItem = items.length > 0 ? items[0] : undefined;

                      // Parse artifact blocks
                      const { textSegments: artifactTextSegments, artifacts } = parseArtifactBlocks(mcqText);
                      const artifactText = artifactTextSegments.join('\n\n');

                      // Parse research links
                      const { textSegments: researchTextSegments, links: researchLinks } = parseResearchLinks(artifactText);
                      const text = researchTextSegments.join('');

                      if (mcqItem) {
                        lastMcqItemRef.current = mcqItem;
                        if (mcqItem.id.startsWith('generated-')) {
                          fetch('/api/log-response', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'generated_item',
                              item: mcqItem,
                              timestamp: new Date().toISOString(),
                              session_id: sessionId,
                            }),
                          }).catch(console.error);
                        }
                      }

                      setMessages((prev) => prev.map((m) =>
                        m.id === assistantMessageId
                          ? {
                              ...m,
                              content: text,
                              mcqItem,
                              artifacts: artifacts.length > 0 ? artifacts : undefined,
                              researchLinks: researchLinks.length > 0 ? researchLinks : undefined,
                              isStreaming: false
                            }
                          : m
                      ));
                    }
                  } catch {
                    // Ignore parse errors
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to continue conversation:', error);
        setMessages((prev) => prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: 'Let me know if you\'d like another question!', isStreaming: false }
            : m
        ));
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages, sessionId, learningStats, context, updateLearnerProfile]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onOpenSettings={() => setSettingsOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        learnerProfile={context?.learnerProfile}
        onUpdateProfile={updateLearnerProfile}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          learningModeEnabled={learningModeEnabled}
          onLearningModeChange={(enabled) => {
            setLearningModeEnabled(enabled);
            persistLearningMode(enabled);
          }}
          showLearningModeToggle={messages.length > 0 || learningModeEnabled}
        />

        {/* Tab bar - only show if there are research tabs */}
        {researchTabs.length > 0 && (
          <TabBar
            tabs={researchTabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseResearchTab}
          />
        )}

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Show either chat or research tab content */}
          {activeTabId ? (
            // Research tab content
            <div className="flex-1 min-w-0">
              {researchTabs.find(t => t.id === activeTabId) && (
                <ResearchTabContent
                  tab={researchTabs.find(t => t.id === activeTabId)!}
                  onOpenResearchTab={handleOpenResearchTab}
                />
              )}
            </div>
          ) : (
            // Chat content
            <div className="flex flex-1 flex-col min-w-0">
              {messages.length === 0 && !isLoading ? (
                <EmptyThread
                  learningModeEnabled={learningModeEnabled}
                  onLearningModeChange={handleLearningModeToggle}
                  onSelectTopic={handleSelectTopic}
                />
              ) : (
                <MessageThread>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageBubble
                        role={message.role}
                        timestamp={message.timestamp}
                      >
                        <MessageContent
                          content={message.content}
                          researchLinks={message.researchLinks}
                          onOpenResearchTab={handleOpenResearchTab}
                        />
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-claude animate-pulse ml-1" />
                        )}
                      </MessageBubble>

                      {/* MCQ Card if present */}
                      {message.mcqItem && !message.isStreaming && (
                        <div className="max-w-[48rem] mx-auto px-4 py-2 pl-12">
                          <MCQCard
                            item={message.mcqItem}
                            onResponse={handleMCQResponse}
                          />
                        </div>
                      )}

                      {/* Artifacts if present */}
                      {message.artifacts && message.artifacts.length > 0 && !message.isStreaming && (
                        <div className="max-w-[48rem] mx-auto px-4 py-2 pl-12 space-y-4">
                          {message.artifacts.map((artifact) => (
                            <ArtifactCard key={artifact.id} artifact={artifact} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <MessageLoading />
                  )}
                </MessageThread>
              )}

              {/* Input */}
              <ChatInput
                ref={chatInputRef}
                onSubmit={handleSendMessage}
                disabled={isLoading}
                learningModeEnabled={learningModeEnabled}
              />
            </div>
          )}

          {/* Learning mode panel (sidebar) - only show once assessment has started */}
          {learningModeEnabled && messages.some(m => m.mcqItem) && (
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
