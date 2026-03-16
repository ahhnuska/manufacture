'use client';

import { ProductCost, Settings, DEFAULT_SETTINGS } from './types';

const STORAGE_KEYS = {
  HISTORY: 'manufacture_history',
  TEMPLATES: 'manufacture_templates',
  SETTINGS: 'manufacture_settings',
} as const;

export function getHistory(): ProductCost[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveToHistory(product: ProductCost): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  history.unshift(product);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function deleteFromHistory(id: string): void {
  if (typeof window === 'undefined') return;
  const history = getHistory().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function getTemplates(): ProductCost[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  return data ? JSON.parse(data) : [];
}

export function saveTemplate(product: ProductCost): void {
  if (typeof window === 'undefined') return;
  const templates = getTemplates();
  const existing = templates.findIndex(t => t.id === product.id);
  if (existing >= 0) {
    templates[existing] = product;
  } else {
    templates.push(product);
  }
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

export function deleteTemplate(id: string): void {
  if (typeof window === 'undefined') return;
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<Settings>): void {
  if (typeof window === 'undefined') return;
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

export function exportToCSV(products: ProductCost[]): string {
  const headers = ['Name', 'Fabric Cost', 'Accessories Cost', 'Labor Cost', 'Master Charge', 'Total CP', 'Date'];
  const rows = products.map(p => [
    p.name,
    p.fabric.totalFabricCost,
    Object.values(p.accessories).reduce((sum, a) => {
      if (Array.isArray(a)) return sum + a.reduce((s, i) => s + i.total, 0);
      return sum + (a.enabled ? a.total : 0);
    }, 0),
    p.labor.total,
    p.masterCharge,
    p.totalCP,
    new Date(p.createdAt).toLocaleDateString(),
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
