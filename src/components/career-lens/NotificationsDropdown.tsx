'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  MessageSquare,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
    message: 'Your CV has been matched with 3 new job opportunities',
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

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-lg border border-transparent p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 max-h-96 p-0 shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sticky top-0 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <Bell className="h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                All caught up!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                No notifications at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-1 bg-white dark:bg-slate-900">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    notification.read ? 'border-transparent' : 'border-violet-500'
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(notification.id);
                          }}
                          className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {notification.timestamp}
                        </span>
                        {notification.action && (
                          <a
                            href={notification.action.href}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                          >
                            {notification.action.label} →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-800">
            <a
              href="/notifications"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              View all notifications →
            </a>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
