'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import itemBank from '@/lib/mcp/item-bank.json';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Code2,
  Tag,
  Layers,
  CheckCircle2,
  XCircle,
  BookOpen,
  BarChart3,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Home,
  Github,
  Sparkles
} from 'lucide-react';

// Types
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
  const tree: Record<string, Record<string, Item[]>> = {};

  items.forEach(item => {
    if (!item.skill_path || item.skill_path.length < 2) return;
    const [l1, l2] = item.skill_path;

    if (!tree[l1]) tree[l1] = {};
    if (!tree[l1][l2]) tree[l1][l2] = [];
    tree[l1][l2].push(item);
  });

  return tree;
}

// Get all unique tags with counts
function getTagCounts(items: Item[]): Map<string, number> {
  const tagCounts = new Map<string, number>();
  items.forEach(item => {
    item.tags?.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  return tagCounts;
}

// Stats card component
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[var(--gray-200)] shadow-[var(--shadow-xs)]">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-semibold text-[var(--gray-900)]">{value}</div>
        <div className="text-sm text-[var(--gray-500)]">{label}</div>
      </div>
    </div>
  );
}

// Badge component
function Badge({ children, variant = 'default', size = 'sm' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'brand'; size?: 'sm' | 'md' }) {
  const variants = {
    default: 'bg-[var(--gray-100)] text-[var(--gray-700)]',
    success: 'bg-[var(--success-50)] text-[var(--success-700)]',
    warning: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
    error: 'bg-[var(--error-50)] text-[var(--error-700)]',
    brand: 'bg-[var(--brand-50)] text-[var(--brand-700)]',
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// Difficulty badge
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant = difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'error';
  return <Badge variant={variant}>{difficulty}</Badge>;
}

// Item card component
function ItemCard({ item, isExpanded, onToggle }: { item: Item; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--gray-200)] shadow-[var(--shadow-xs)] overflow-hidden hover:shadow-[var(--shadow-sm)] hover:border-[var(--gray-300)] transition-all">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-start gap-4 text-left"
      >
        <div className="mt-0.5">
          {isExpanded ? (
            <ChevronDown size={18} className="text-[var(--gray-400)]" />
          ) : (
            <ChevronRight size={18} className="text-[var(--gray-400)]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <DifficultyBadge difficulty={item.difficulty} />
            <span className="text-xs font-mono text-[var(--gray-400)]">{item.id}</span>
            {item.code && (
              <Code2 size={14} className="text-[var(--gray-400)]" />
            )}
          </div>
          <p className="text-sm text-[var(--gray-900)] leading-relaxed line-clamp-2">{item.stem}</p>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-[var(--gray-100)]">
          {/* Code block */}
          {item.code && (
            <div className="mt-4 rounded-lg overflow-hidden">
              <div className="bg-[var(--gray-900)] px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--error-500)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--warning-500)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--success-500)]" />
                </div>
                <span className="text-xs text-[var(--gray-400)] ml-2">code</span>
              </div>
              <pre className="bg-[var(--gray-800)] p-4 overflow-x-auto">
                <code className="text-sm text-[var(--gray-100)] font-mono">{item.code}</code>
              </pre>
            </div>
          )}

          {/* Options */}
          <div className="mt-4 space-y-2">
            {item.options.map(opt => (
              <div
                key={opt.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  opt.id === item.correct
                    ? 'bg-[var(--success-25)] border-[var(--success-500)]'
                    : 'bg-[var(--gray-50)] border-[var(--gray-200)]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  opt.id === item.correct
                    ? 'bg-[var(--success-500)] text-white'
                    : 'bg-[var(--gray-200)] text-[var(--gray-600)]'
                }`}>
                  {opt.id === item.correct ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <span className="text-xs font-medium">{opt.id}</span>
                  )}
                </div>
                <span className={`text-sm ${opt.id === item.correct ? 'text-[var(--success-700)] font-medium' : 'text-[var(--gray-700)]'}`}>
                  {opt.text}
                </span>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="mt-4 p-4 bg-[var(--brand-25)] rounded-lg border border-[var(--brand-100)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[var(--brand-500)]" />
              <span className="text-xs font-semibold text-[var(--brand-700)] uppercase tracking-wide">Explanation</span>
            </div>
            <p className="text-sm text-[var(--gray-700)] leading-relaxed">{item.feedback.explanation}</p>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {item.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-[var(--gray-100)] text-[var(--gray-600)] rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            {/* Skill path */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--gray-400)]">
              <Layers size={12} />
              <span>{item.skill_path?.join(' → ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar tree item
function TreeItem({ label, count, isActive, onClick, level = 0 }: { label: string; count: number; isActive: boolean; onClick: () => void; level?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-medium'
          : 'text-[var(--gray-600)] hover:bg-[var(--gray-50)] hover:text-[var(--gray-900)]'
      }`}
      style={{ paddingLeft: `${12 + level * 12}px` }}
    >
      <span className="truncate">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-[var(--brand-100)]' : 'bg-[var(--gray-100)]'}`}>
        {count}
      </span>
    </button>
  );
}

export default function ExplorerPage() {
  const items = itemBank.items as Item[];
  const skillTree = useMemo(() => buildSkillTree(items), [items]);
  const tagCounts = useMemo(() => getTagCounts(items), [items]);
  const sortedTags = useMemo(() =>
    Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]),
    [tagCounts]
  );

  // State
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedSkillPath, setSelectedSkillPath] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Computed stats
  const difficultyStats = useMemo(() => {
    const stats = { easy: 0, medium: 0, hard: 0 };
    items.forEach(item => {
      stats[item.difficulty as keyof typeof stats]++;
    });
    return stats;
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matches =
          item.stem.toLowerCase().includes(searchLower) ||
          item.id.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower) ||
          item.tags?.some(t => t.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }

      if (selectedTags.size > 0) {
        const hasTag = item.tags?.some(t => selectedTags.has(t));
        if (!hasTag) return false;
      }

      if (selectedDifficulty && item.difficulty !== selectedDifficulty) {
        return false;
      }

      if (selectedSkillPath) {
        const path = item.skill_path?.slice(0, 2).join('/');
        if (path !== selectedSkillPath) return false;
      }

      return true;
    });
  }, [items, search, selectedTags, selectedDifficulty, selectedSkillPath]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const clearFilters = () => {
    setSearch('');
    setSelectedTags(new Set());
    setSelectedDifficulty(null);
    setSelectedSkillPath(null);
  };

  const hasFilters = search || selectedTags.size > 0 || selectedDifficulty || selectedSkillPath;

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--gray-200)]">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-[var(--gray-900)] hover:text-[var(--brand-600)] transition-colors">
              <BookOpen size={24} className="text-[var(--brand-600)]" />
              <span className="font-semibold">MCQMCP</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 text-sm text-[var(--gray-600)] hover:text-[var(--gray-900)] rounded-lg hover:bg-[var(--gray-50)]">
                Home
              </Link>
              <Link href="/demo" className="px-3 py-2 text-sm text-[var(--gray-600)] hover:text-[var(--gray-900)] rounded-lg hover:bg-[var(--gray-50)]">
                Demo
              </Link>
              <Link href="/explorer" className="px-3 py-2 text-sm text-[var(--brand-600)] font-medium rounded-lg bg-[var(--brand-50)]">
                Item Explorer
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/JDerekLomas/claude-mcq-assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[var(--gray-500)] hover:text-[var(--gray-700)] transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--gray-900)] mb-2">Item Explorer</h1>
          <p className="text-[var(--gray-500)]">Browse and search {items.length} validated assessment items across multiple domains.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Items" value={items.length} icon={BookOpen} color="bg-[var(--brand-50)] text-[var(--brand-600)]" />
          <StatCard label="Easy" value={difficultyStats.easy} icon={CheckCircle2} color="bg-[var(--success-50)] text-[var(--success-600)]" />
          <StatCard label="Medium" value={difficultyStats.medium} icon={BarChart3} color="bg-[var(--warning-50)] text-[var(--warning-600)]" />
          <StatCard label="Hard" value={difficultyStats.hard} icon={XCircle} color="bg-[var(--error-50)] text-[var(--error-600)]" />
        </div>

        {/* Search and filter bar */}
        <div className="bg-white rounded-xl border border-[var(--gray-200)] shadow-[var(--shadow-xs)] p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]" />
              <input
                type="text"
                placeholder="Search items by text, ID, code, or tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[var(--gray-300)] rounded-lg text-sm focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)] outline-none"
              />
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center gap-2">
              {['easy', 'medium', 'hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors capitalize ${
                    selectedDifficulty === diff
                      ? 'bg-[var(--brand-50)] border-[var(--brand-500)] text-[var(--brand-700)]'
                      : 'border-[var(--gray-300)] text-[var(--gray-600)] hover:border-[var(--gray-400)]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                showFilters
                  ? 'bg-[var(--brand-50)] border-[var(--brand-500)] text-[var(--brand-700)]'
                  : 'border-[var(--gray-300)] text-[var(--gray-600)] hover:border-[var(--gray-400)]'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {(selectedTags.size > 0 || selectedSkillPath) && (
                <span className="w-5 h-5 rounded-full bg-[var(--brand-600)] text-white text-xs flex items-center justify-center">
                  {selectedTags.size + (selectedSkillPath ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--gray-600)] hover:text-[var(--gray-900)] transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[var(--gray-200)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Skill paths */}
                <div>
                  <h3 className="text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wide mb-3">Skill Path</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(skillTree).map(([domain, subdomains]) =>
                      Object.entries(subdomains).map(([subdomain, domainItems]) => {
                        const path = `${domain}/${subdomain}`;
                        const isSelected = selectedSkillPath === path;
                        return (
                          <button
                            key={path}
                            onClick={() => setSelectedSkillPath(isSelected ? null : path)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-[var(--brand-50)] border-[var(--brand-500)] text-[var(--brand-700)]'
                                : 'border-[var(--gray-200)] text-[var(--gray-600)] hover:border-[var(--gray-300)]'
                            }`}
                          >
                            {domain} / {subdomain}
                            <span className="ml-1.5 text-[var(--gray-400)]">({domainItems.length})</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wide mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {sortedTags.slice(0, 20).map(([tag, count]) => {
                      const isSelected = selectedTags.has(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-[var(--brand-50)] border-[var(--brand-500)] text-[var(--brand-700)]'
                              : 'border-[var(--gray-200)] text-[var(--gray-600)] hover:border-[var(--gray-300)]'
                          }`}
                        >
                          {tag}
                          <span className="ml-1.5 text-[var(--gray-400)]">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[var(--gray-500)]">
            Showing <span className="font-medium text-[var(--gray-900)]">{filteredItems.length}</span> of {items.length} items
          </p>
        </div>

        {/* Items grid */}
        <div className="space-y-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-[var(--gray-200)]">
              <Search size={48} className="mx-auto text-[var(--gray-300)] mb-4" />
              <p className="text-[var(--gray-500)] mb-2">No items match your filters</p>
              <button
                onClick={clearFilters}
                className="text-sm text-[var(--brand-600)] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
