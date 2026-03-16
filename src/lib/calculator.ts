import {
  AccessoryRow,
  BagMeasurements,
  CostMode,
  FabricGroup,
  FabricPart,
  ProductCost,
  PurchaseUnit,
  PURCHASE_UNIT_INCHES,
} from './types';

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function ceilToTwoDecimals(value: number): number {
  return Math.ceil(value * 100) / 100;
}

export function createEmptyBagMeasurements(
  overrides: Partial<BagMeasurements> = {}
): BagMeasurements {
  return {
    length: 0,
    width: 0,
    height: 0,
    ...overrides,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function purchaseUnitToInches(unit: PurchaseUnit): number {
  return PURCHASE_UNIT_INCHES[unit];
}

export function calculateFabricPart(part: FabricPart): FabricPart {
  const length = Math.max(0, part.lengthInInches);
  const width = Math.max(0, part.widthInInches);
  const quantity = Math.max(0, part.quantity);

  return {
    ...part,
    lengthInInches: length,
    widthInInches: width,
    quantity,
    partArea: roundToTwoDecimals(length * width * quantity),
  };
}

export function createBagPartsFromMeasurements(
  measurements: BagMeasurements
): FabricPart[] {
  const { length, width, height } = measurements;

  return [
    createEmptyFabricPart({
      name: 'Front Panel',
      note: 'Auto from bag size',
      lengthInInches: length,
      widthInInches: height,
      quantity: 1,
    }),
    createEmptyFabricPart({
      name: 'Back Panel',
      note: 'Auto from bag size',
      lengthInInches: length,
      widthInInches: height,
      quantity: 1,
    }),
    createEmptyFabricPart({
      name: 'Side Panels',
      note: 'Auto from bag size',
      lengthInInches: width,
      widthInInches: height,
      quantity: 2,
    }),
    createEmptyFabricPart({
      name: 'Bottom Panel',
      note: 'Auto from bag size',
      lengthInInches: length,
      widthInInches: width,
      quantity: 1,
    }),
  ];
}

export function calculateFabricGroup(group: FabricGroup): FabricGroup {
  const purchaseUnitInInches = purchaseUnitToInches(group.purchaseUnit);
  const parts = group.parts.map(calculateFabricPart);
  const requiredArea = roundToTwoDecimals(
    parts.reduce((sum, part) => sum + part.partArea, 0)
  );
  const safeWidth = Math.max(1, group.fabricWidthInInches);
  const baseRequiredLength = requiredArea / safeWidth;
  const requiredLengthInInches = ceilToTwoDecimals(
    baseRequiredLength * (1 + Math.max(0, group.wastagePercent) / 100)
  );
  const purchaseUnitsNeeded = ceilToTwoDecimals(
    requiredLengthInInches / purchaseUnitInInches
  );
  const totalCost = roundToTwoDecimals(
    purchaseUnitsNeeded * Math.max(0, group.pricePerPurchaseUnit)
  );
  const productsPerPurchaseUnitRaw =
    requiredLengthInInches > 0
      ? purchaseUnitInInches / requiredLengthInInches
      : 0;
  const productsPerPurchaseUnit =
    productsPerPurchaseUnitRaw >= 1
      ? Math.floor(productsPerPurchaseUnitRaw)
      : roundToTwoDecimals(productsPerPurchaseUnitRaw);

  return {
    ...group,
    purchaseUnitInInches,
    fabricWidthInInches: safeWidth,
    parts,
    requiredArea,
    requiredLengthInInches,
    purchaseUnitsNeeded,
    totalCost,
    productsPerPurchaseUnit,
  };
}

export function calculateAccessoryRow(row: AccessoryRow): AccessoryRow {
  const costMode: CostMode = row.costMode;

  if (costMode === 'weight') {
    const purchaseWeight = Math.max(0, row.purchaseWeight);
    const purchasePrice = Math.max(0, row.purchasePrice);
    const weightUsedPerBag = Math.max(0, row.weightUsedPerBag);
    const pricePerWeightUnit =
      purchaseWeight > 0 ? roundToTwoDecimals(purchasePrice / purchaseWeight) : 0;
    const total = roundToTwoDecimals(pricePerWeightUnit * weightUsedPerBag);

    return {
      ...row,
      purchaseWeight,
      purchasePrice,
      weightUsedPerBag,
      pricePerWeightUnit,
      total,
      quantityUsedPerBag: 0,
      unitPrice: 0,
    };
  }

  const quantityUsedPerBag = Math.max(0, row.quantityUsedPerBag);
  const unitPrice = Math.max(0, row.unitPrice);
  const total = roundToTwoDecimals(quantityUsedPerBag * unitPrice);

  return {
    ...row,
    quantityUsedPerBag,
    unitPrice,
    total,
    pricePerWeightUnit: 0,
    purchaseWeight: 0,
    purchasePrice: 0,
    weightUsedPerBag: 0,
  };
}

export function calculateMeasurementEstimate(
  measurements: BagMeasurements,
  options: {
    purchaseUnit: PurchaseUnit;
    fabricWidthInInches: number;
    wastagePercent: number;
    pricePerPurchaseUnit: number;
  }
) {
  const generatedGroup = calculateFabricGroup(
    createEmptyFabricGroup(options.fabricWidthInInches, options.pricePerPurchaseUnit, {
      name: 'Measurement Estimate',
      purchaseUnit: options.purchaseUnit,
      wastagePercent: options.wastagePercent,
      parts: createBagPartsFromMeasurements(measurements),
    })
  );

  return generatedGroup;
}

export function calculateFabricCost(fabricGroups: FabricGroup[]): number {
  return roundToTwoDecimals(
    fabricGroups.reduce(
      (sum, group) => sum + calculateFabricGroup(group).totalCost,
      0
    )
  );
}

export function calculateAccessoriesCost(accessoryRows: AccessoryRow[]): number {
  return roundToTwoDecimals(
    accessoryRows.reduce((sum, row) => sum + calculateAccessoryRow(row).total, 0)
  );
}

export function calculateLaborCost(rate: number, units: number): number {
  return roundToTwoDecimals(Math.max(0, rate) * Math.max(0, units));
}

export function calculateMasterCharge(masterChargeRs: number): number {
  return roundToTwoDecimals(Math.max(0, masterChargeRs));
}

export function calculateTotalCP(
  fabricCost: number,
  accessoriesCost: number,
  laborCost: number,
  masterCharge: number
): number {
  return roundToTwoDecimals(
    fabricCost + accessoriesCost + laborCost + masterCharge
  );
}

export function createEmptyFabricPart(overrides: Partial<FabricPart> = {}): FabricPart {
  return calculateFabricPart({
    id: generateId(),
    name: '',
    note: '',
    lengthInInches: 0,
    widthInInches: 0,
    quantity: 1,
    partArea: 0,
    ...overrides,
  });
}

export function createEmptyFabricGroup(
  defaultFabricWidth = 44,
  defaultPricePerPurchaseUnit = 500,
  overrides: Partial<FabricGroup> = {}
): FabricGroup {
  return calculateFabricGroup({
    id: generateId(),
    name: '',
    purchaseUnit: 'gauza',
    purchaseUnitInInches: purchaseUnitToInches('gauza'),
    pricePerPurchaseUnit: defaultPricePerPurchaseUnit,
    fabricWidthInInches: defaultFabricWidth,
    wastagePercent: 15,
    parts: [createEmptyFabricPart({ name: 'Body Panel', note: 'Main panel' })],
    requiredArea: 0,
    requiredLengthInInches: 0,
    purchaseUnitsNeeded: 0,
    totalCost: 0,
    productsPerPurchaseUnit: 0,
    ...overrides,
  });
}

export function createAccessoryRow(
  name = '',
  costMode: CostMode = 'quantity',
  overrides: Partial<AccessoryRow> = {}
): AccessoryRow {
  return calculateAccessoryRow({
    id: generateId(),
    name,
    costMode,
    quantityUsedPerBag: 0,
    unitPrice: 0,
    purchaseWeight: 0,
    purchasePrice: 0,
    weightUsedPerBag: 0,
    pricePerWeightUnit: 0,
    total: 0,
    ...overrides,
  });
}

export function createStarterAccessoryRows(): AccessoryRow[] {
  return [
    createAccessoryRow('Chain'),
    createAccessoryRow('Buckle'),
    createAccessoryRow('D-Lock'),
    createAccessoryRow('Gum/Elastic'),
  ];
}

export function createProductCost(
  name: string,
  bagMeasurements: BagMeasurements,
  fabricGroups: FabricGroup[],
  accessoryRows: AccessoryRow[],
  labor: { rate: number; units: number },
  masterChargeRs: number
): ProductCost {
  const calculatedFabricGroups = fabricGroups.map(calculateFabricGroup);
  const calculatedAccessoryRows = accessoryRows.map(calculateAccessoryRow);
  const fabricCost = calculateFabricCost(calculatedFabricGroups);
  const accessoriesCost = calculateAccessoriesCost(calculatedAccessoryRows);
  const laborCost = calculateLaborCost(labor.rate, labor.units);
  const masterChargeAmount = calculateMasterCharge(masterChargeRs);
  const totalCP = calculateTotalCP(
    fabricCost,
    accessoriesCost,
    laborCost,
    masterChargeAmount
  );

  return {
    id: generateId(),
    name,
    bagMeasurements,
    fabricGroups: calculatedFabricGroups,
    fabricSummary: {
      totalCost: fabricCost,
    },
    accessoryRows: calculatedAccessoryRows,
    accessorySummary: {
      totalCost: accessoriesCost,
    },
    labor: {
      ...labor,
      total: laborCost,
    },
    masterCharge: masterChargeAmount,
    totalCP,
    createdAt: new Date().toISOString(),
  };
}
