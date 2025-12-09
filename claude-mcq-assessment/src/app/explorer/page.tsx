'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/marketing/Navigation';
import itemBank from '@/lib/mcp/item-bank.json';
import { ChevronDown, ChevronRight, Search, Filter, Code, Tag, Layers } from 'lucide-react';

interface Option {
  id: string;
  text: string;
}

interface Feedback {
  correct: string;
  incorrect: string;
  explanation: string;
}

interface Item {
  id: string;
  topic: string;
  difficulty: string;
  stem: string;
  code?: string;
  options: Option[];
  correct: string;
  feedback: Feedback;
  skill_path?: string[];
  tags?: string[];
}

// Build skill tree from items
function buildSkillTree(items: Item[]) {
  const tree: Record<string, Record<string, Record<string, Item[]>>> = {};

  items.forEach(item => {
    if (!item.skill_path || item.skill_path.length < 2) return;
    const [l1, l2, l3 = 'general'] = item.skill_path;

    if (!tree[l1]) tree[l1] = {};
    if (!tree[l1][l2]) tree[l1][l2] = {};
    if (!tree[l1][l2][l3]) tree[l1][l2][l3] = [];
    tree[l1][l2][l3].push(item);
  });

  return tree;
}

// Get all unique tags
function getAllTags(items: Item[]): string[] {
  const tagSet = new Set<string>();
  items.forEach(item => {
    item.tags?.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// Difficulty badge colors
const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

function ItemCard({ item, expanded, onToggle }: { item: Item; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-edge-default rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-secondary transition-colors"
      >
        {expanded ? <ChevronDown size={18} className="mt-0.5 shrink-0" /> : <ChevronRight size={18} className="mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[item.difficulty as keyof typeof difficultyColors]}`}>
              {item.difficulty}
            </span>
            <span className="text-xs text-ink-tertiary font-mono">{item.id}</span>
          </div>
          <p className="text-sm text-ink-primary line-clamp-2">{item.stem}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-edge-default bg-surface-secondary">
          {item.code && (
            <pre className="mt-3 p-3 bg-ink-primary text-white text-xs rounded-md overflow-x-auto">
              <code>{item.code}</code>
            </pre>
          )}

          <div className="mt-3 space-y-1">
            {item.options.map(opt => (
              <div
                key={opt.id}
                className={`flex gap-2 p-2 rounded text-sm ${
                  opt.id === item.correct ? 'bg-green-50 border border-green-200' : 'bg-white border border-edge-default'
                }`}
              >
                <span className={`font-medium ${opt.id === item.correct ? 'text-green-700' : 'text-ink-secondary'}`}>
                  {opt.id}.
                </span>
                <span className={opt.id === item.correct ? 'text-green-800' : 'text-ink-primary'}>{opt.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-900">{item.feedback.explanation}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags?.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-ink-primary/5 text-ink-secondary rounded">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2 text-xs text-ink-tertiary">
            <Layers size={12} className="inline mr-1" />
            {item.skill_path?.join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  const items = itemBank.items as Item[];
  const skillTree = useMemo(() => buildSkillTree(items), [items]);
  const allTags = useMemo(() => getAllTags(items), [items]);

  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['javascript', 'react']));

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matches =
          item.stem.toLowerCase().includes(searchLower) ||
          item.id.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower) ||
          item.tags?.some(t => t.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }

      // Tag filter
      if (selectedTags.size > 0) {
        const hasTag = item.tags?.some(t => selectedTags.has(t));
        if (!hasTag) return false;
      }

      // Difficulty filter
      if (selectedDifficulty && item.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [items, search, selectedTags, selectedDifficulty]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-primary mb-2">Item Explorer</h1>
          <p className="text-ink-secondary">Browse and search the {items.length} assessment items in the bank.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-edge-default rounded-lg focus:outline-none focus:ring-2 focus:ring-claude/20"
            />
          </div>

          {/* Difficulty filter */}
          <select
            value={selectedDifficulty || ''}
            onChange={e => setSelectedDifficulty(e.target.value || null)}
            className="px-4 py-2 border border-edge-default rounded-lg bg-white"
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Tag cloud */}
        <div className="mb-6 p-4 bg-surface-secondary rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-ink-tertiary" />
            <span className="text-sm font-medium text-ink-secondary">Filter by tags</span>
            {selectedTags.size > 0 && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="text-xs text-claude hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-claude text-white'
                    : 'bg-white border border-edge-default text-ink-secondary hover:border-claude'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Skill tree sidebar */}
          <div className="w-64 shrink-0">
            <div className="sticky top-24 p-4 bg-surface-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-ink-tertiary" />
                <span className="text-sm font-medium text-ink-secondary">Skill Tree</span>
              </div>

              <div className="space-y-1">
                {Object.entries(skillTree).map(([l1, l2Map]) => (
                  <div key={l1}>
                    <button
                      onClick={() => togglePath(l1)}
                      className="w-full flex items-center gap-1 py-1 text-sm font-medium text-ink-primary hover:text-claude"
                    >
                      {expandedPaths.has(l1) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {l1}
                      <span className="ml-auto text-xs text-ink-tertiary">
                        {Object.values(l2Map).flatMap(l3 => Object.values(l3).flat()).length}
                      </span>
                    </button>

                    {expandedPaths.has(l1) && (
                      <div className="ml-4 border-l border-edge-default pl-2 space-y-1">
                        {Object.entries(l2Map).map(([l2, l3Map]) => (
                          <div key={l2}>
                            <button
                              onClick={() => togglePath(`${l1}/${l2}`)}
                              className="w-full flex items-center gap-1 py-0.5 text-xs text-ink-secondary hover:text-claude"
                            >
                              {expandedPaths.has(`${l1}/${l2}`) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              {l2}
                              <span className="ml-auto text-xs text-ink-tertiary">
                                {Object.values(l3Map).flat().length}
                              </span>
                            </button>

                            {expandedPaths.has(`${l1}/${l2}`) && (
                              <div className="ml-3 space-y-0.5">
                                {Object.entries(l3Map).map(([l3, itemsInPath]) => (
                                  <div key={l3} className="text-xs text-ink-tertiary py-0.5 flex justify-between">
                                    <span>{l3}</span>
                                    <span>{itemsInPath.length}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 space-y-3">
            <div className="text-sm text-ink-secondary mb-4">
              Showing {filteredItems.length} of {items.length} items
            </div>

            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                expanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-ink-secondary">
                No items match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
