'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Trash2,
  ArchiveX,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'CV Matched Successfully',
    message: 'Your CV has been matched with 3 new job opportunities in your field',
    timestamp: '2 hours ago',
    read: false,
    action: { label: 'View Jobs', href: '/jobs' },
  },
  {
    id: '2',
    type: 'info',
    title: 'New Skill Recommendation',
    message: 'Based on job trends, React skills are in high demand in your region',
    timestamp: '5 hours ago',
    read: false,
    action: { label: 'Learn React', href: '/roadmap' },
  },
  {
    id: '3',
    type: 'tip',
    title: 'Complete Your Profile',
    message: 'Your profile is 75% complete. Add more skills to improve match rate',
    timestamp: '1 day ago',
    read: true,
    action: { label: 'Edit Profile', href: '/profile' },
  },
  {
    id: '4',
    type: 'warning',
    title: 'Certificate Expiring Soon',
    message: 'Your AWS certification expires in 30 days. Schedule renewal',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Market Insight Update',
    message: 'Salary in your region increased 3.5% this month',
    timestamp: '1 week ago',
    read: true,
    action: { label: 'View Insights', href: '/salary-insights' },
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    case 'tip':
      return <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50';
    case 'tip':
      return 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-900/50';
  }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(
    (n) => filter === 'all' || !n.read
  );

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Stay updated with important alerts and recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Mark all as read
          </button>
          <button
            onClick={handleDeleteAll}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="inline-block mr-2 h-4 w-4" />
            Clear all
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? 'All Notifications' : 'Unread Only'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 dark:border-slate-700 dark:bg-slate-900/50">
          <Bell className="h-12 w-12 text-slate-400" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            All caught up!
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            You don't have any {filter === 'unread' ? 'unread' : ''} notifications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border-l-4 p-4 transition-all ${
                notification.read
                  ? 'border-transparent bg-slate-50 dark:bg-slate-800/50'
                  : 'border-violet-500 bg-violet-50 dark:border-violet-500 dark:bg-violet-900/20'
              } hover:shadow-md`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 pt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-violet-600" />
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {notification.message}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {notification.timestamp}
                    </span>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                          Mark as read
                        </button>
                      )}
                      {notification.action && (
                        <a
                          href={notification.action.href}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                          {notification.action.label} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
