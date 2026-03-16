'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, DEFAULT_SETTINGS } from '../../lib/types';
import { getSettings, saveSettings } from '../../lib/storage';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => getSettings() || DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Settings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure default values and preferences
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-8 space-y-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Default Values
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Set defaults for new calculations</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                Default Fabric Price <span className="text-zinc-400 font-normal">(NPR)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">NPR</span>
                <input
                  type="number"
                  value={settings.defaultPricePerGauza}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultPricePerGauza: Number(e.target.value) }))}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Used as the default starting price for new fabric cards. Gauza = 36 inches, meter = 39.37 inches, yard = 36 inches.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                Default Labor Rate <span className="text-zinc-400 font-normal">(NPR)</span>
              </label>
              <input
                type="number"
                value={settings.defaultLaborRate}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultLaborRate: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                Default Master Charge <span className="text-zinc-400 font-normal">(NPR)</span>
              </label>
              <input
                type="number"
                value={settings.defaultMasterCharge}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultMasterCharge: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              />
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Overhead cost per bag (in NPR)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                Default Fabric Width <span className="text-zinc-400 font-normal">(inch)</span>
              </label>
              <select
                value={settings.defaultFabricWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultFabricWidth: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              >
                <option value={44}>44 inch</option>
                <option value={58}>58 inch</option>
                <option value={60}>60 inch</option>
              </select>
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Standard fabric roll width
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              >
                <option value="NPR">NPR - Nepalese Rupee</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleSave}
            className={`w-full px-6 py-4 font-medium rounded-xl transition-all duration-300 ${
              saved 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-600/40'
            }`}
          >
            {saved ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved Successfully!
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                AI Image Analysis
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure Gemini API for image analysis</p>
            </div>
          </div>
          <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              To use AI Image Analysis, you need to set up a Google Gemini API key.
            </p>
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Create a <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">.env.local</code> file in your project root with:
              </p>
              <pre className="p-4 bg-zinc-900 dark:bg-zinc-950 rounded-xl text-zinc-100 text-sm font-mono overflow-x-auto">
                <code>GEMINI_API_KEY=your_api_key_here</code>
              </pre>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  Google AI Studio
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
