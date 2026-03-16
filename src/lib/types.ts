export interface FabricDetails {
  length: number;
  width: number;
  height: number;
  wastagePercent: number;
  fabricWidth: number;
  gauzaNeeded: number;
}

export interface Accessories {
  chains: AccessoryItem;
  buckles: AccessoryItem;
  dLocks: AccessoryItem;
  gum: AccessoryItem;
  flaps: AccessoryItem;
  others: AccessoryItem[];
}

export interface AccessoryItem {
  enabled: boolean;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
}

export interface ProductCost {
  id: string;
  name: string;
  fabric: FabricDetails & {
    pricePerGauza: number;
    totalFabricCost: number;
  };
  accessories: Accessories;
  labor: {
    rate: number;
    units: number;
    total: number;
  };
  masterCharge: number;
  totalCP: number;
  createdAt: string;
}

export interface Settings {
  defaultPricePerGauza: number;
  defaultLaborRate: number;
  defaultMasterCharge: number; // in NPR (Rs), not percentage
  defaultFabricWidth: number;
  currency: string;
}

export interface FabricAnalysis {
  length: number;
  width: number;
  height: number;
  wastagePercent: number;
  gauzaNeeded: number;
  accessories: {
    hasChains: boolean;
    chainLength?: number;
    buckleCount: number;
    dLockCount: number;
    hasGum: boolean;
    gumLength?: number;
  };
  sewingComplexity: 'simple' | 'medium' | 'complex';
}

export const DEFAULT_SETTINGS: Settings = {
  defaultPricePerGauza: 500,
  defaultLaborRate: 100,
  defaultMasterCharge: 30,
  defaultFabricWidth: 44,
  currency: 'NPR',
};

export const GAUZA_IN_INCHES = 36;

export const FABRIC_WIDTH_OPTIONS = [44, 58, 60] as const;

export type FabricWidth = typeof FABRIC_WIDTH_OPTIONS[number];

export type AccessoryType = 'chains' | 'buckles' | 'dLocks' | 'gum' | 'others';
