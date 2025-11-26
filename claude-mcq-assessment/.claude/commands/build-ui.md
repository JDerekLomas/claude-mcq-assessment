Build UI component: $ARGUMENTS

Reference the design system in lib/design-system.ts and tailwind.config.ts.

Follow Claude.ai's exact aesthetic:
- Warm terracotta primary (#C15F3C)
- Clean backgrounds (#FFFFFF, #F9F9F8)
- Subtle borders (#E5E5E3)
- System fonts, smooth animations
- Generous whitespace

Component requirements:
1. TypeScript with explicit prop types
2. Use cn() utility for conditional classes
3. Keyboard accessible
4. Smooth transitions (0.2s default)

Available components:
- Sidebar: conversation history, grouped by date
- ChatHeader: model selector dropdown, Learning Mode toggle
- MessageThread: scrollable container with messages
- MessageBubble: user (gray bg) vs assistant (white bg)
- MCQCard: interactive assessment with options
- ChatInput: textarea with send button, file upload
- LearningModePanel: difficulty slider, stats

Commit when component is complete and tested.
