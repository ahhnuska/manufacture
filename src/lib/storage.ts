'use client';

import { ProductCost, Settings } from './types';
import {
  calculateAccessoryRow,
  calculateAccessoriesCost,
  calculateFabricCost,
  calculateFabricGroup,
  calculateLaborCost,
  createEmptyBagMeasurements,
  calculateMasterCharge,
  calculateTotalCP,
  createAccessoryRow,
  createEmptyFabricGroup,
  createEmptyFabricPart,
  generateId,
  purchaseUnitToInches,
} from './calculator';
import { DEFAULT_SETTINGS } from './types';

const STORAGE_KEYS = {
  HISTORY: 'manufacture_history',
  TEMPLATES: 'manufacture_templates',
  SETTINGS: 'manufacture_settings',
} as const;

function parseStoredArray(key: string): unknown[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeLegacyAccessories(rawAccessories: Record<string, unknown>) {
  const normalizedRows = Object.entries(rawAccessories).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => {
        const row = item as Record<string, unknown>;
        return calculateAccessoryRow(
          createAccessoryRow(String(row.name || 'Accessory'), 'quantity', {
            quantityUsedPerBag: Number(row.quantity || 0),
            unitPrice: Number(
              row.unitPrice ||
                (Number(row.quantity || 0) > 0
                  ? Number(row.total || 0) / Number(row.quantity || 0)
                  : row.costPrice || 0)
            ),
          })
        );
      });
    }

    const item = value as Record<string, unknown>;
    if (!item.enabled) return [];

    return [
      calculateAccessoryRow(
        createAccessoryRow(String(item.name || key), 'quantity', {
          quantityUsedPerBag: Number(item.quantity || 0),
          unitPrice: Number(
            item.unitPrice ||
              (Number(item.quantity || 0) > 0
                ? Number(item.total || 0) / Number(item.quantity || 0)
                : item.costPrice || 0)
          ),
        })
      ),
    ];
  });

  return normalizedRows;
}

function normalizeLegacyFabric(rawFabric: Record<string, unknown>) {
  const purchaseUnitInInches = purchaseUnitToInches('gauza');
  const fabricWidthInInches = Number(rawFabric.fabricWidth || DEFAULT_SETTINGS.defaultFabricWidth);
  const wastagePercent = Number(rawFabric.wastagePercent || 0);
  const gauzaNeeded = Number(rawFabric.gauzaNeeded || 0);
  const requiredLengthInInches = gauzaNeeded * purchaseUnitInInches;
  const baseLengthInInches =
    wastagePercent >= 0 ? requiredLengthInInches / (1 + wastagePercent / 100) : requiredLengthInInches;

  return calculateFabricGroup(
    createEmptyFabricGroup(fabricWidthInInches, Number(rawFabric.pricePerGauza || DEFAULT_SETTINGS.defaultPricePerGauza), {
      name: 'Main Fabric',
      purchaseUnit: 'gauza',
      fabricWidthInInches,
      wastagePercent,
      parts: [
        createEmptyFabricPart({
          name: 'Legacy estimate',
          note: 'Imported from previous calculator',
          lengthInInches: baseLengthInInches,
          widthInInches: fabricWidthInInches,
          quantity: 1,
        }),
      ],
    })
  );
}

export function normalizeStoredProduct(raw: unknown): ProductCost | null {
  if (!raw || typeof raw !== 'object') return null;

  const product = raw as Record<string, unknown>;

  if (Array.isArray(product.fabricGroups) && Array.isArray(product.accessoryRows)) {
    const fabricGroups = product.fabricGroups.map((group) =>
      calculateFabricGroup({
        ...createEmptyFabricGroup(),
        ...(group as object),
      })
    );
    const accessoryRows = product.accessoryRows.map((row) =>
      calculateAccessoryRow({
        ...createAccessoryRow(),
        ...(row as object),
      })
    );
    const fabricCost = calculateFabricCost(fabricGroups);
    const accessoryCost = calculateAccessoriesCost(accessoryRows);
    const labor = {
      rate: Number((product.labor as Record<string, unknown> | undefined)?.rate || 0),
      units: Number((product.labor as Record<string, unknown> | undefined)?.units || 0),
      total: calculateLaborCost(
        Number((product.labor as Record<string, unknown> | undefined)?.rate || 0),
        Number((product.labor as Record<string, unknown> | undefined)?.units || 0)
      ),
    };
    const masterCharge = calculateMasterCharge(Number(product.masterCharge || 0));

    return {
      id: String(product.id || generateId()),
      name: String(product.name || 'Untitled Product'),
      bagMeasurements: createEmptyBagMeasurements(
        (product.bagMeasurements as Record<string, unknown> | undefined)
          ? {
              length: Number(
                (product.bagMeasurements as Record<string, unknown>).length || 0
              ),
              width: Number(
                (product.bagMeasurements as Record<string, unknown>).width || 0
              ),
              height: Number(
                (product.bagMeasurements as Record<string, unknown>).height || 0
              ),
            }
          : {}
      ),
      fabricGroups,
      fabricSummary: { totalCost: fabricCost },
      accessoryRows,
      accessorySummary: { totalCost: accessoryCost },
      labor,
      masterCharge,
      totalCP: calculateTotalCP(fabricCost, accessoryCost, labor.total, masterCharge),
      createdAt: String(product.createdAt || new Date().toISOString()),
    };
  }

  if (product.fabric && product.accessories) {
    const rawFabric = product.fabric as Record<string, unknown>;
    const rawAccessories = product.accessories as Record<string, unknown>;
    const fabricGroups = [normalizeLegacyFabric(rawFabric)];
    const accessoryRows = normalizeLegacyAccessories(rawAccessories);
    const fabricCost = calculateFabricCost(fabricGroups);
    const accessoryCost = calculateAccessoriesCost(accessoryRows);
    const labor = {
      rate: Number((product.labor as Record<string, unknown> | undefined)?.rate || 0),
      units: Number((product.labor as Record<string, unknown> | undefined)?.units || 0),
      total: calculateLaborCost(
        Number((product.labor as Record<string, unknown> | undefined)?.rate || 0),
        Number((product.labor as Record<string, unknown> | undefined)?.units || 0)
      ),
    };
    const masterCharge = calculateMasterCharge(Number(product.masterCharge || 0));

    return {
      id: String(product.id || generateId()),
      name: String(product.name || 'Untitled Product'),
      bagMeasurements: createEmptyBagMeasurements({
        length: Number(rawFabric.length || 0),
        width: Number(rawFabric.width || 0),
        height: Number(rawFabric.height || 0),
      }),
      fabricGroups,
      fabricSummary: { totalCost: fabricCost },
      accessoryRows,
      accessorySummary: { totalCost: accessoryCost },
      labor,
      masterCharge,
      totalCP: calculateTotalCP(fabricCost, accessoryCost, labor.total, masterCharge),
      createdAt: String(product.createdAt || new Date().toISOString()),
    };
  }

  return null;
}

function getNormalizedProducts(key: string): ProductCost[] {
  return parseStoredArray(key)
    .map(normalizeStoredProduct)
    .filter((product): product is ProductCost => product !== null);
}

function saveProducts(key: string, products: ProductCost[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(products));
}

export function getHistory(): ProductCost[] {
  return getNormalizedProducts(STORAGE_KEYS.HISTORY);
}

export function saveToHistory(product: ProductCost): void {
  const history = getHistory();
  history.unshift(product);
  saveProducts(STORAGE_KEYS.HISTORY, history);
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((product) => product.id !== id);
  saveProducts(STORAGE_KEYS.HISTORY, history);
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function getTemplates(): ProductCost[] {
  return getNormalizedProducts(STORAGE_KEYS.TEMPLATES);
}

export function saveTemplate(product: ProductCost): void {
  const templates = getTemplates();
  const existingIndex = templates.findIndex((template) => template.id === product.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = product;
  } else {
    templates.push(product);
  }

  saveProducts(STORAGE_KEYS.TEMPLATES, templates);
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter((template) => template.id !== id);
  saveProducts(STORAGE_KEYS.TEMPLATES, templates);
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  if (!data) return DEFAULT_SETTINGS;

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<Settings>): void {
  if (typeof window === 'undefined') return;
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

export function exportToCSV(products: ProductCost[]): string {
  const headers = [
    'Name',
    'Fabric Cost',
    'Accessories Cost',
    'Labor Cost',
    'Master Charge',
    'Total CP',
    'Date',
  ];

  const rows = products.map((product) => [
    product.name,
    product.fabricSummary.totalCost,
    product.accessorySummary.totalCost,
    product.labor.total,
    product.masterCharge,
    product.totalCP,
    new Date(product.createdAt).toLocaleDateString(),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
