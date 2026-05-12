'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, Palette, Globe, Eye, Download, Trash2, LogOut, Check } from 'lucide-react';

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'appearance' | 'data';

export function UserSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    fullName: 'John Doe',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Developer',
    company: 'Tech Company',
    bio: 'Passionate about web development and tech innovation',
  });
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Manage your account preferences and settings</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Password & Security</h2>
              <button className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                <Lock className="inline-block mr-2 h-4 w-4" />
                Change Password
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-all ${
                  saved ? 'bg-green-600' : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {saved && <Check className="h-4 w-4" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">Notification settings management component would go here.</p>
          </div>
        )}

        {/* Privacy & Security Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Privacy Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Public Profile</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow others to see your profile</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Show Activity</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Display your activity status</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Allow Messages</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Receive messages from other users</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/20">
              <h2 className="mb-4 text-lg font-semibold text-red-900 dark:text-red-300">Danger Zone</h2>
              <div className="space-y-2">
                <button className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                  <LogOut className="inline-block mr-2 h-4 w-4" />
                  Logout All Devices
                </button>
                <button className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                  <Trash2 className="inline-block mr-2 h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Theme</h2>
              
              <div className="grid gap-3 grid-cols-3">
                {[
                  { id: 'light', label: 'Light', icon: '☀️' },
                  { id: 'dark', label: 'Dark', icon: '🌙' },
                  { id: 'system', label: 'System', icon: '⚙️' },
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      theme === option.id
                        ? 'border-violet-600 bg-violet-50 dark:border-violet-500 dark:bg-violet-900/20'
                        : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Language</h2>
              
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        )}

        {/* Data & Privacy Tab */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Data Management</h2>
              
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-left font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  <Download className="inline-block mr-2 h-4 w-4" />
                  Download Your Data
                </button>
                
                <button className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-left font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  <Eye className="inline-block mr-2 h-4 w-4" />
                  View Privacy Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
