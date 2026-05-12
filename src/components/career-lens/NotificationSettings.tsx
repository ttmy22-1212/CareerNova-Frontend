'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Eye, Lock, Palette, Globe, Volume2, X } from 'lucide-react';

const notificationSettings = [
  {
    category: 'Job Alerts',
    icon: MessageSquare,
    settings: [
      { id: 'job-match', label: 'New job matches', description: 'Get notified when new jobs match your profile', enabled: true },
      { id: 'job-expiry', label: 'Saved jobs expiring', description: 'Reminder before bookmarked jobs expire', enabled: true },
      { id: 'job-expire-soon', label: 'Jobs closing soon', description: 'Alert for jobs closing within 3 days', enabled: false },
    ],
  },
  {
    category: 'Learning & Development',
    icon: Eye,
    settings: [
      { id: 'course-recommendation', label: 'Course recommendations', description: 'New courses matching your goals', enabled: true },
      { id: 'skill-trend', label: 'Skill trends', description: 'Popular skills in your region', enabled: true },
      { id: 'course-discount', label: 'Course discounts', description: 'Special offers on learning platforms', enabled: false },
    ],
  },
  {
    category: 'Account & Security',
    icon: Lock,
    settings: [
      { id: 'account-update', label: 'Account updates', description: 'Important account notifications', enabled: true },
      { id: 'security-alert', label: 'Security alerts', description: 'Suspicious activity alerts', enabled: true },
      { id: 'login-attempt', label: 'Login attempts', description: 'Notification for all login attempts', enabled: false },
    ],
  },
  {
    category: 'Communication',
    icon: Mail,
    settings: [
      { id: 'email-digest', label: 'Weekly digest', description: 'Summary of your weekly activity', enabled: true },
      { id: 'news', label: 'Industry news', description: 'Latest tech industry news', enabled: false },
      { id: 'product-update', label: 'Product updates', description: 'New features and improvements', enabled: true },
    ],
  },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState(
    notificationSettings.reduce((acc, category) => {
      category.settings.forEach(setting => {
        acc[setting.id] = setting.enabled;
      });
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleSetting = (id: string) => {
    setSettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notification Settings</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Manage how you receive notifications from Career Lens</p>
      </div>

      {/* Global Settings */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Global Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Enable all notifications</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Turn on/off all notifications at once</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 cursor-pointer rounded border-slate-300 text-violet-600"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Quiet hours</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Don't send notifications between 8 PM - 8 AM</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 cursor-pointer rounded border-slate-300 text-violet-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Sound notifications</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Play sound when important notifications arrive</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 cursor-pointer rounded border-slate-300 text-violet-600"
            />
          </div>
        </div>
      </div>

      {/* Category Settings */}
      {notificationSettings.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.category} className="rounded-lg border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            {/* Category Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{category.category}</h2>
              </div>
            </div>

            {/* Settings List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {category.settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white">{setting.label}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[setting.id]}
                    onChange={() => toggleSetting(setting.id)}
                    className="h-5 w-5 cursor-pointer rounded border-slate-300 text-violet-600"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Save Button */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">
          Save Changes
        </button>
        <button className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Reset to Default
        </button>
      </div>
    </div>
  );
}
