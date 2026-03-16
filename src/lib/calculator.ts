import { FabricDetails, Accessories, AccessoryItem, GAUZA_IN_INCHES, ProductCost } from './types';

export function calculateGauzaNeeded(
  length: number,
  width: number,
  height: number,
  wastagePercent: number,
  fabricWidth: number = 44
): number {
  const front = length * height;
  const back = length * height;
  const sides = width * height * 2;
  const bottom = length * width;

  const totalArea = front + back + sides + bottom;

  const fabricLength = totalArea / fabricWidth;

  const fabricLengthWithWastage = fabricLength * (1 + wastagePercent / 100);

  const gauzaNeeded = fabricLengthWithWastage / GAUZA_IN_INCHES;

  return Math.ceil(gauzaNeeded * 100) / 100;
}

export function calculateFabricCost(
  gauzaNeeded: number,
  pricePerGauza: number
): number {
  return gauzaNeeded * pricePerGauza;
}

export function calculateAccessoriesCost(accessories: Accessories): number {
  let total = 0;
  
  if (accessories.chains.enabled) total += accessories.chains.total;
  if (accessories.buckles.enabled) total += accessories.buckles.total;
  if (accessories.dLocks.enabled) total += accessories.dLocks.total;
  if (accessories.gum.enabled) total += accessories.gum.total;
  if (accessories.flaps.enabled) total += accessories.flaps.total;
  
  for (const other of accessories.others) {
    if (other.enabled) total += other.total;
  }
  
  return total;
}

export function calculateLaborCost(rate: number, units: number): number {
  return rate * units;
}

export function calculateMasterCharge(
  masterChargeRs: number
): number {
  return masterChargeRs;
}

export function calculateTotalCP(
  fabricCost: number,
  accessoriesCost: number,
  laborCost: number,
  masterCharge: number
): number {
  return fabricCost + accessoriesCost + laborCost + masterCharge;
}

export function createEmptyAccessories(): Accessories {
  return {
    chains: { enabled: false, name: 'Chain', quantity: 0, unitPrice: 0, costPrice: 0, total: 0 },
    buckles: { enabled: false, name: 'Buckle', quantity: 0, unitPrice: 0, costPrice: 0, total: 0 },
    dLocks: { enabled: false, name: 'D-Lock', quantity: 0, unitPrice: 0, costPrice: 0, total: 0 },
    gum: { enabled: false, name: 'Gum/Elastic', quantity: 0, unitPrice: 0, costPrice: 0, total: 0 },
    flaps: { enabled: false, name: 'Flaps', quantity: 0, unitPrice: 0, costPrice: 0, total: 0 },
    others: [],
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createProductCost(
  name: string,
  fabric: FabricDetails & { pricePerGauza: number },
  accessories: Accessories,
  labor: { rate: number; units: number },
  masterChargeRs: number
): ProductCost {
  const fabricCost = calculateFabricCost(fabric.gauzaNeeded, fabric.pricePerGauza);
  const accessoriesCost = calculateAccessoriesCost(accessories);
  const laborCost = calculateLaborCost(labor.rate, labor.units);
  const masterChargeAmount = calculateMasterCharge(masterChargeRs);
  const totalCP = calculateTotalCP(fabricCost, accessoriesCost, laborCost, masterChargeAmount);

  return {
    id: generateId(),
    name,
    fabric: {
      ...fabric,
      totalFabricCost: fabricCost,
    },
    accessories,
    labor: {
      ...labor,
      total: laborCost,
    },
    masterCharge: masterChargeAmount,
    totalCP,
    createdAt: new Date().toISOString(),
  };
}
