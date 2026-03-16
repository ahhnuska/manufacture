'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AccessoryRow,
  FabricAnalysis,
  FabricGroup,
  FABRIC_WIDTH_OPTIONS,
  ProductCost,
  PURCHASE_UNIT_LABELS,
  Settings,
} from '../../lib/types';
import {
  calculateAccessoriesCost,
  calculateFabricCost,
  calculateLaborCost,
  calculateMeasurementEstimate,
  calculateMasterCharge,
  calculateTotalCP,
  createAccessoryRow,
  createBagPartsFromMeasurements,
  createEmptyBagMeasurements,
  createEmptyFabricGroup,
  createEmptyFabricPart,
  createProductCost,
  calculateFabricGroup,
} from '../../lib/calculator';
import { getSettings, getTemplates, saveTemplate, saveToHistory } from '../../lib/storage';
import AccessoriesInput from './AccessoriesInput';
import CostBreakdown from './CostBreakdown';
import ImageAnalyzer from './ImageAnalyzer';

interface CalculatorFormProps {
  initialProduct?: ProductCost;
}

function createDefaultState(settings: Settings) {
  return {
    productName: '',
    bagMeasurements: createEmptyBagMeasurements(),
    fabricGroups: [
      createEmptyFabricGroup(settings.defaultFabricWidth, settings.defaultPricePerGauza, {
        name: 'Main Fabric',
      }),
    ],
    accessoryRows: [
      createAccessoryRow('Chain'),
      createAccessoryRow('Buckle'),
      createAccessoryRow('D-Lock'),
      createAccessoryRow('Gum/Elastic'),
    ],
    laborRate: settings.defaultLaborRate,
    laborUnits: 1,
    masterChargeRs: settings.defaultMasterCharge,
  };
}

export default function CalculatorForm({ initialProduct }: CalculatorFormProps) {
  const searchParams = useSearchParams();
  const settings = useMemo(() => getSettings(), []);
  const templateId = searchParams.get('template');
  const sourceProduct = useMemo(() => {
    if (initialProduct) return initialProduct;
    if (!templateId) return undefined;
    return getTemplates().find((item) => item.id === templateId);
  }, [initialProduct, templateId]);
  const initialState = useMemo(() => {
    if (sourceProduct) {
      return {
        productName: sourceProduct.name,
        bagMeasurements: sourceProduct.bagMeasurements,
        fabricGroups: sourceProduct.fabricGroups,
        accessoryRows: sourceProduct.accessoryRows,
        laborRate: sourceProduct.labor.rate,
        laborUnits: sourceProduct.labor.units,
        masterChargeRs: sourceProduct.masterCharge,
      };
    }

    return createDefaultState(settings);
  }, [settings, sourceProduct]);
  const [productName, setProductName] = useState(initialState.productName);
  const [bagMeasurements, setBagMeasurements] = useState(initialState.bagMeasurements);
  const [fabricGroups, setFabricGroups] = useState<FabricGroup[]>(initialState.fabricGroups);
  const [accessoryRows, setAccessoryRows] = useState<AccessoryRow[]>(initialState.accessoryRows);
  const [laborRate, setLaborRate] = useState(initialState.laborRate);
  const [laborUnits, setLaborUnits] = useState(initialState.laborUnits);
  const [masterChargeRs, setMasterChargeRs] = useState(initialState.masterChargeRs);
  const [activeTab, setActiveTab] = useState<'manual' | 'image'>('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const baseCalculatedFabricGroups = useMemo(
    () => fabricGroups.map(calculateFabricGroup),
    [fabricGroups]
  );
  const accessoriesCost = useMemo(
    () => calculateAccessoriesCost(accessoryRows),
    [accessoryRows]
  );
  const laborCost = useMemo(
    () => calculateLaborCost(laborRate, laborUnits),
    [laborRate, laborUnits]
  );
  const masterCharge = useMemo(
    () => calculateMasterCharge(masterChargeRs),
    [masterChargeRs]
  );
  const primaryFabricGroup = baseCalculatedFabricGroups[0];
  const measurementEstimate = useMemo(() => {
    if (!primaryFabricGroup) return null;
    if (
      bagMeasurements.length <= 0 ||
      bagMeasurements.width <= 0 ||
      bagMeasurements.height <= 0
    ) {
      return null;
    }

    return calculateMeasurementEstimate(bagMeasurements, {
      purchaseUnit: primaryFabricGroup.purchaseUnit,
      fabricWidthInInches: primaryFabricGroup.fabricWidthInInches,
      wastagePercent: primaryFabricGroup.wastagePercent,
      pricePerPurchaseUnit: primaryFabricGroup.pricePerPurchaseUnit,
    });
  }, [bagMeasurements, primaryFabricGroup]);
  const calculatedFabricGroups = useMemo(
    () =>
      baseCalculatedFabricGroups.map((group, index) => {
        if (index === 0 && measurementEstimate) {
          return {
            ...measurementEstimate,
            id: group.id,
            name: group.name,
          };
        }

        return group;
    }),
    [baseCalculatedFabricGroups, measurementEstimate]
  );
  const fabricCost = useMemo(
    () => calculateFabricCost(calculatedFabricGroups),
    [calculatedFabricGroups]
  );
  const totalCP = useMemo(
    () => calculateTotalCP(fabricCost, accessoriesCost, laborCost, masterCharge),
    [fabricCost, accessoriesCost, laborCost, masterCharge]
  );

  const addFabricGroup = () => {
    if (!settings) return;
    setFabricGroups((current) => [
      ...current,
      createEmptyFabricGroup(settings.defaultFabricWidth, settings.defaultPricePerGauza, {
        name: `Fabric ${current.length + 1}`,
      }),
    ]);
  };

  const removeFabricGroup = (id: string) => {
    setFabricGroups((current) => current.filter((group) => group.id !== id));
  };

  const updateFabricGroup = (
    id: string,
    field: keyof FabricGroup,
    value: string | number
  ) => {
    setFabricGroups((current) =>
      current.map((group) =>
        group.id === id ? calculateFabricGroup({ ...group, [field]: value }) : group
      )
    );
  };

  const addFabricPart = (groupId: string) => {
    setFabricGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? calculateFabricGroup({
              ...group,
              parts: [
                ...group.parts,
                createEmptyFabricPart({ name: `Part ${group.parts.length + 1}`, quantity: 1 }),
              ],
            })
          : group
      )
    );
  };

  const updateFabricPart = (
    groupId: string,
    partId: string,
    field: 'name' | 'note' | 'lengthInInches' | 'widthInInches',
    value: string | number
  ) => {
    setFabricGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? calculateFabricGroup({
              ...group,
              parts: group.parts.map((part) =>
                part.id === partId ? { ...part, [field]: value } : part
              ),
            })
          : group
      )
    );
  };

  const removeFabricPart = (groupId: string, partId: string) => {
    setFabricGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? calculateFabricGroup({
              ...group,
              parts: group.parts.filter((part) => part.id !== partId),
            })
          : group
      )
    );
  };

  const handlePersist = (persist: (product: ProductCost) => void, successMessage: string) => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (calculatedFabricGroups.length === 0) {
      alert('Please add at least one fabric group');
      return;
    }

    const product = createProductCost(
      productName,
      bagMeasurements,
      calculatedFabricGroups,
      accessoryRows,
      { rate: laborRate, units: laborUnits },
      masterChargeRs
    );
    persist(product);
    alert(successMessage);
  };

  const handleAnalysisComplete = (analysis: FabricAnalysis) => {
    setBagMeasurements({
      length: analysis.length,
      width: analysis.width,
      height: analysis.height,
    });

    setFabricGroups((current) => {
      const primaryGroup =
        current[0] ||
        createEmptyFabricGroup(
          settings?.defaultFabricWidth ?? 44,
          settings?.defaultPricePerGauza ?? 500
        );

      const parts = createBagPartsFromMeasurements({
        length: analysis.length,
        width: analysis.width,
        height: analysis.height,
      });

      const updatedPrimary = calculateFabricGroup({
        ...primaryGroup,
        name: primaryGroup.name || 'Main Fabric',
        wastagePercent: analysis.wastagePercent,
        parts,
      });

      return [updatedPrimary, ...current.slice(1)];
    });

    setAccessoryRows((current) => {
      const nextRows = [...current];

      const upsertQuantityRow = (name: string, quantityUsedPerBag: number) => {
        const existingIndex = nextRows.findIndex(
          (row) => row.name.toLowerCase() === name.toLowerCase()
        );
        const nextRow = createAccessoryRow(name, 'quantity', { quantityUsedPerBag });

        if (existingIndex >= 0) {
          nextRows[existingIndex] = createAccessoryRow(name, 'quantity', {
            ...nextRows[existingIndex],
            name,
            quantityUsedPerBag,
          });
        } else {
          nextRows.push(nextRow);
        }
      };

      if (analysis.accessories.hasChains) {
        upsertQuantityRow('Chain', analysis.accessories.chainLength || 0);
      }
      if (analysis.accessories.buckleCount > 0) {
        upsertQuantityRow('Buckle', analysis.accessories.buckleCount);
      }
      if (analysis.accessories.dLockCount > 0) {
        upsertQuantityRow('D-Lock', analysis.accessories.dLockCount);
      }
      if (analysis.accessories.hasGum) {
        upsertQuantityRow('Gum/Elastic', analysis.accessories.gumLength || 0);
      }

      return nextRows;
    });

    setActiveTab('manual');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Cost Calculator
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Calculate multi-fabric manufacturing cost for each product
                </p>
              </div>
              <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl">
                {(['manual', 'image'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab === 'manual' ? 'Manual' : 'AI Analyze'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="e.g., Canvas Backpack, Leather Bag, Messenger"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Bag Measurements
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Restore calculation using bag length, width, and height
                  </p>
                </div>
                {primaryFabricGroup ? (
                  <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                    Main fabric is calculated from these measurements
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'length', label: 'Length' },
                  { key: 'width', label: 'Width' },
                  { key: 'height', label: 'Height' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                      {field.label} <span className="text-zinc-400 font-normal">(inch)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bagMeasurements[field.key as keyof typeof bagMeasurements] || ''}
                      onChange={(event) =>
                        setBagMeasurements((current) => ({
                          ...current,
                          [field.key]: Number(event.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                ))}
              </div>

              {measurementEstimate ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                  <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Required length
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                      {measurementEstimate.requiredLengthInInches.toFixed(2)} in
                    </div>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {primaryFabricGroup?.purchaseUnit} needed
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                      {measurementEstimate.purchaseUnitsNeeded.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Bags from 1 {primaryFabricGroup?.purchaseUnit}
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                      {measurementEstimate.productsPerPurchaseUnit}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Estimated main fabric cost
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                      NPR {measurementEstimate.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {activeTab === 'image' ? (
              <ImageAnalyzer
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Fabrics
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Add one card per fabric and list the parts cut from it
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addFabricGroup}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium"
                  >
                    Add Fabric
                  </button>
                </div>

                {calculatedFabricGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 p-5 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(event) =>
                          updateFabricGroup(group.id, 'name', event.target.value)
                        }
                        placeholder="Fabric name"
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeFabricGroup(group.id)}
                        disabled={calculatedFabricGroups.length === 1}
                        className="px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                          Purchase unit
                        </label>
                        <select
                          value={group.purchaseUnit}
                          onChange={(event) =>
                            updateFabricGroup(group.id, 'purchaseUnit', event.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        >
                          {Object.entries(PURCHASE_UNIT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                          Price per unit
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={group.pricePerPurchaseUnit || ''}
                          onChange={(event) =>
                            updateFabricGroup(
                              group.id,
                              'pricePerPurchaseUnit',
                              Number(event.target.value)
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                          Fabric width (inch)
                        </label>
                        <select
                          value={group.fabricWidthInInches}
                          onChange={(event) =>
                            updateFabricGroup(
                              group.id,
                              'fabricWidthInInches',
                              Number(event.target.value)
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        >
                          {FABRIC_WIDTH_OPTIONS.map((width) => (
                            <option key={width} value={width}>
                              {width} inch
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                          Wastage (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={group.wastagePercent || ''}
                          onChange={(event) =>
                            updateFabricGroup(
                              group.id,
                              'wastagePercent',
                              Number(event.target.value)
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>

                    {group.id === primaryFabricGroup?.id && measurementEstimate ? (
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
                        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          Main Fabric Formula
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          Uses bag measurements directly:
                          {' '}front = length × height, back = length × height, sides = width × height × 2, bottom = length × width.
                        </p>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          This section is auto-calculated so height is always included.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Extra Fabric Parts
                          </h3>
                          <button
                            type="button"
                            onClick={() => addFabricPart(group.id)}
                            className="text-sm font-medium text-amber-700 dark:text-amber-400"
                          >
                            Add Part
                          </button>
                        </div>
                        {group.parts.map((part) => (
                          <div
                            key={part.id}
                            className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={part.name}
                                onChange={(event) =>
                                  updateFabricPart(group.id, part.id, 'name', event.target.value)
                                }
                                placeholder="Part name"
                                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                              />
                              <input
                                type="text"
                                value={part.note}
                                onChange={(event) =>
                                  updateFabricPart(group.id, part.id, 'note', event.target.value)
                                }
                                placeholder="Use / note"
                                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input
                                type="number"
                                min="0"
                                value={part.lengthInInches || ''}
                                onChange={(event) =>
                                  updateFabricPart(
                                    group.id,
                                    part.id,
                                    'lengthInInches',
                                    Number(event.target.value)
                                  )
                                }
                                placeholder="Length (inch)"
                                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                              />
                              <input
                                type="number"
                                min="0"
                                value={part.widthInInches || ''}
                                onChange={(event) =>
                                  updateFabricPart(
                                    group.id,
                                    part.id,
                                    'widthInInches',
                                    Number(event.target.value)
                                  )
                                }
                                placeholder="Width (inch)"
                                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                              />
                              <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                                <div>
                                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Area</div>
                                  <div className="font-mono text-zinc-900 dark:text-zinc-100">
                                    {part.partArea.toFixed(2)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFabricPart(group.id, part.id)}
                                  className="text-red-600 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Quantity removed. If you need multiple extra pieces, add separate rows.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Area</div>
                        <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {group.requiredArea.toFixed(2)} sq in
                        </div>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Length needed</div>
                        <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {group.requiredLengthInInches.toFixed(2)} in
                        </div>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Purchase units</div>
                        <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {group.purchaseUnitsNeeded.toFixed(2)} {group.purchaseUnit}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Products per unit</div>
                        <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {group.productsPerPurchaseUnit}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AccessoriesInput
            accessoryRows={accessoryRows}
            setAccessoryRows={setAccessoryRows}
          />

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-8 animate-fade-in delay-200">
            <h2 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-zinc-100">
              Labor & Overhead
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                  Labor Rate (NPR)
                </label>
                <input
                  type="number"
                  value={laborRate}
                  onChange={(event) => setLaborRate(Number(event.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                  Units
                </label>
                <input
                  type="number"
                  value={laborUnits}
                  onChange={(event) => setLaborUnits(Number(event.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                  Master Charge (NPR)
                </label>
                <input
                  type="number"
                  value={masterChargeRs}
                  onChange={(event) => setMasterChargeRs(Number(event.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in delay-300">
            <button
              type="button"
              onClick={() => handlePersist(saveToHistory, 'Saved to history!')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20"
            >
              Save to History
            </button>
            <button
              type="button"
              onClick={() => handlePersist(saveTemplate, 'Saved as template!')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-medium rounded-xl shadow-lg shadow-violet-600/20"
            >
              Save as Template
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <CostBreakdown
            fabricGroups={calculatedFabricGroups}
            accessoryRows={accessoryRows}
            fabricCost={fabricCost}
            accessoriesCost={accessoriesCost}
            laborCost={laborCost}
            masterCharge={masterCharge}
            totalCP={totalCP}
          />
        </div>
      </div>
    </div>
  );
}
