export type PurchaseUnit = 'gauza' | 'meter' | 'yard';

export type CostMode = 'quantity' | 'weight';

export interface BagMeasurements {
  length: number;
  width: number;
  height: number;
}

export interface FabricPart {
  id: string;
  name: string;
  note: string;
  lengthInInches: number;
  widthInInches: number;
  quantity: number;
  partArea: number;
}

export interface FabricGroup {
  id: string;
  name: string;
  purchaseUnit: PurchaseUnit;
  purchaseUnitInInches: number;
  pricePerPurchaseUnit: number;
  fabricWidthInInches: number;
  wastagePercent: number;
  parts: FabricPart[];
  requiredArea: number;
  requiredLengthInInches: number;
  purchaseUnitsNeeded: number;
  totalCost: number;
  productsPerPurchaseUnit: number;
}

export interface AccessoryRow {
  id: string;
  name: string;
  costMode: CostMode;
  quantityUsedPerBag: number;
  unitPrice: number;
  purchaseWeight: number;
  purchasePrice: number;
  weightUsedPerBag: number;
  pricePerWeightUnit: number;
  total: number;
}

export interface ProductCost {
  id: string;
  name: string;
  bagMeasurements: BagMeasurements;
  fabricGroups: FabricGroup[];
  fabricSummary: {
    totalCost: number;
  };
  accessoryRows: AccessoryRow[];
  accessorySummary: {
    totalCost: number;
  };
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
  defaultMasterCharge: number;
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

export const PURCHASE_UNIT_INCHES: Record<PurchaseUnit, number> = {
  gauza: 36,
  meter: 39.37,
  yard: 36,
};

export const PURCHASE_UNIT_LABELS: Record<PurchaseUnit, string> = {
  gauza: 'Gauza',
  meter: 'Meter',
  yard: 'Yard',
};

export const FABRIC_WIDTH_OPTIONS = [44, 58, 60] as const;

export type FabricWidth = typeof FABRIC_WIDTH_OPTIONS[number];
