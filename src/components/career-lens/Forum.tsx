'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Eye,
  Flame,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Clock,
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  category: string;
  views: number;
  replies: number;
  likes: number;
  timestamp: string;
  pinned: boolean;
  trending: boolean;
}

const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best practices for React 18 performance optimization',
    content: 'Share your tips and tricks for optimizing React 18 applications. I\'m particularly interested in...',
    author: 'Sarah Chen',
    avatar: '👩‍💻',
    category: 'React',
    views: 1250,
    replies: 28,
    likes: 156,
    timestamp: '2 hours ago',
    pinned: true,
    trending: true,
  },
  {
    id: '2',
    title: 'Transitioning from Vue to React - Challenges & Solutions',
    content: 'Recently switched from Vue to React in my company. Here are some challenges I faced...',
    author: 'Mike Johnson',
    avatar: '👨‍💻',
    category: 'JavaScript',
    views: 892,
    replies: 42,
    likes: 204,
    timestamp: '5 hours ago',
    pinned: false,
    trending: true,
  },
  {
    id: '3',
    title: 'Resume tips for tech interviews - What worked for me',
    content: 'Just landed my dream job! Here\'s what I did on my resume that made the difference...',
    author: 'Alex Lee',
    avatar: '👤',
    category: 'Career',
    views: 2156,
    replies: 67,
    likes: 389,
    timestamp: '1 day ago',
    pinned: true,
    trending: false,
  },
  {
    id: '4',
    title: 'TypeScript vs JavaScript - Which one are you using in 2025?',
    content: 'Curious about the community\'s take on TypeScript adoption. Do you use it in all projects or...',
    author: 'Lisa Wang',
    avatar: '👩‍🔬',
    category: 'TypeScript',
    views: 1567,
    replies: 89,
    likes: 312,
    timestamp: '2 days ago',
    pinned: false,
    trending: false,
  },
  {
    id: '5',
    title: 'How to effectively negotiate salary as a developer',
    content: 'This is a topic many of us avoid but it\'s crucial for career growth. Here\'s my approach...',
    author: 'David Brown',
    avatar: '👨‍💼',
    category: 'Career',
    views: 3421,
    replies: 156,
    likes: 567,
    timestamp: '3 days ago',
    pinned: false,
    trending: false,
  },
];

const categories = ['All', 'React', 'JavaScript', 'TypeScript', 'Career', 'DevOps', 'Web Design', 'Other'];

export function Forum() {
  const [posts, setPosts] = useState<ForumPost[]>(forumPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'popular'>('recent');

  const filteredPosts = posts
    .filter(
      (p) =>
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'trending') {
        return b.trending ? 1 : -1;
      } else {
        return b.likes - a.likes;
      }
    });

  const pinnedPosts = filteredPosts.filter((p) => p.pinned);
  const regularPosts = filteredPosts.filter((p) => !p.pinned);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Community Forum</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Share knowledge, ask questions, and connect with developers
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">
          <Plus className="h-5 w-5" />
          New Discussion
        </button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
          >
            <option value="recent">Most Recent</option>
            <option value="trending">Trending</option>
            <option value="popular">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <Flame className="h-4 w-4" />
            Pinned Discussions
          </h2>
          {pinnedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-3">
        {regularPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 dark:border-slate-700 dark:bg-slate-900/50">
            <MessageSquare className="h-12 w-12 text-slate-400" />
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
              No discussions found
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Try adjusting your search or category filters
            </p>
          </div>
        ) : (
          regularPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: ForumPost }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex gap-4 p-4">
        {/* Avatar & Stats */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl">{post.avatar}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {post.trending && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </span>
                )}
                <span className="inline-flex rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  {post.category}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer">
                {post.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {post.content}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">{post.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.timestamp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 text-right">
          <div className="flex items-center gap-1 justify-end text-slate-600 dark:text-slate-400">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">{post.views}</span>
          </div>
          <div className="flex items-center gap-1 justify-end text-slate-600 dark:text-slate-400">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{post.replies}</span>
          </div>
          <button className="flex items-center gap-1 justify-end rounded-lg bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-medium">{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
