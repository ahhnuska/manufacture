'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, ProductCost, FabricDetails, Accessories, FABRIC_WIDTH_OPTIONS } from '../../lib/types';
import { 
  calculateGauzaNeeded, 
  calculateFabricCost,
  calculateAccessoriesCost,
  calculateLaborCost,
  calculateMasterCharge,
  calculateTotalCP,
  createEmptyAccessories,
  createProductCost
} from '../../lib/calculator';
import { getSettings, saveToHistory, saveTemplate } from '../../lib/storage';
import ImageAnalyzer from './ImageAnalyzer';
import AccessoriesInput from './AccessoriesInput';
import CostBreakdown from './CostBreakdown';

interface CalculatorFormProps {
  initialProduct?: ProductCost;
}

export default function CalculatorForm({ initialProduct }: CalculatorFormProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [productName, setProductName] = useState(initialProduct?.name || '');
  const [fabric, setFabric] = useState<FabricDetails>(
    initialProduct?.fabric || {
      length: 0,
      width: 0,
      height: 0,
      wastagePercent: 15,
      fabricWidth: 44,
      gauzaNeeded: 0,
    }
  );
  const [fabricPrice, setFabricPrice] = useState(
    initialProduct?.fabric.pricePerGauza || 500
  );
  const [accessories, setAccessories] = useState<Accessories>(
    initialProduct?.accessories || createEmptyAccessories()
  );
  const [laborRate, setLaborRate] = useState(
    initialProduct?.labor.rate || 100
  );
  const [laborUnits, setLaborUnits] = useState(
    initialProduct?.labor.units || 1
  );
  const [masterChargeRs, setMasterChargeRs] = useState(
    initialProduct?.masterCharge || 30
  );
  const [activeTab, setActiveTab] = useState<'manual' | 'image'>('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    if (!initialProduct) {
      setFabricPrice(s.defaultPricePerGauza);
      setLaborRate(s.defaultLaborRate);
      setMasterChargeRs(s.defaultMasterCharge);
      setFabric((prev: FabricDetails) => ({ ...prev, fabricWidth: s.defaultFabricWidth }));
    }
  }, [initialProduct]);

  useEffect(() => {
    if (fabric.length > 0 && fabric.width > 0) {
      const gauza = calculateGauzaNeeded(
        fabric.length,
        fabric.width,
        fabric.height,
        fabric.wastagePercent,
        fabric.fabricWidth
      );
      setFabric((prev: FabricDetails) => ({ ...prev, gauzaNeeded: gauza }));
    }
  }, [fabric.length, fabric.width, fabric.height, fabric.wastagePercent, fabric.fabricWidth]);

  const fabricCost = calculateFabricCost(fabric.gauzaNeeded, fabricPrice);
  const accessoriesCost = calculateAccessoriesCost(accessories);
  const laborCost = calculateLaborCost(laborRate, laborUnits);
  const subtotal = fabricCost + accessoriesCost + laborCost;
  const masterCharge = calculateMasterCharge(masterChargeRs);
  const totalCP = calculateTotalCP(fabricCost, accessoriesCost, laborCost, masterCharge);

  const handleSaveToHistory = useCallback(() => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (totalCP <= 0) {
      alert('Please enter valid measurements');
      return;
    }

    const product = createProductCost(
      productName,
      { ...fabric, pricePerGauza: fabricPrice },
      accessories,
      { rate: laborRate, units: laborUnits },
      masterChargeRs
    );
    saveToHistory(product);
    alert('Saved to history!');
  }, [productName, fabric, fabricPrice, accessories, laborRate, laborUnits, masterChargeRs, totalCP]);

  const handleSaveAsTemplate = useCallback(() => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    const product = createProductCost(
      productName,
      { ...fabric, pricePerGauza: fabricPrice },
      accessories,
      { rate: laborRate, units: laborUnits },
      masterChargeRs
    );
    saveTemplate(product);
    alert('Saved as template!');
  }, [productName, fabric, fabricPrice, accessories, laborRate, laborUnits, masterChargeRs]);

  const handleAnalysisComplete = useCallback((analysis: {
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
  }) => {
    setFabric((prev: FabricDetails) => ({
      ...prev,
      length: analysis.length,
      width: analysis.width,
      height: analysis.height,
      wastagePercent: analysis.wastagePercent,
      gauzaNeeded: analysis.gauzaNeeded,
    }));

    setAccessories((prev: Accessories) => ({
      ...prev,
      chains: {
        ...prev.chains,
        enabled: analysis.accessories.hasChains,
        quantity: analysis.accessories.chainLength || 0,
      },
      buckles: {
        ...prev.buckles,
        enabled: analysis.accessories.buckleCount > 0,
        quantity: analysis.accessories.buckleCount,
      },
      dLocks: {
        ...prev.dLocks,
        enabled: analysis.accessories.dLockCount > 0,
        quantity: analysis.accessories.dLockCount,
      },
      gum: {
        ...prev.gum,
        enabled: analysis.accessories.hasGum,
        quantity: analysis.accessories.gumLength || 0,
      },
    }));

    setActiveTab('manual');
  }, []);

  if (!settings) return <div className="p-8 text-center">Loading...</div>;

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
                  Calculate manufacturing cost for your products
                </p>
              </div>
              <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl">
                {[
                  { id: 'manual', label: 'Manual', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                  { id: 'image', label: 'AI Analyze', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'manual' | 'image')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    {tab.label}
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
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Canvas Backpack, Leather Bag, Messenger"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              />
            </div>

            {activeTab === 'manual' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { key: 'length', label: 'Length', suffix: 'inch' },
                    { key: 'width', label: 'Width', suffix: 'inch' },
                    { key: 'height', label: 'Height', suffix: 'inch' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                        {field.label} <span className="text-zinc-400 font-normal">({field.suffix})</span>
                      </label>
                      <input
                        type="number"
                        value={fabric[field.key as keyof FabricDetails] as number || ''}
                        onChange={(e) => setFabric((prev: FabricDetails) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                      Wastage <span className="text-zinc-400 font-normal">(%)</span>
                    </label>
                    <input
                      type="number"
                      value={fabric.wastagePercent}
                      onChange={(e) => setFabric((prev: FabricDetails) => ({ ...prev, wastagePercent: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                      Gauza Needed <span className="text-zinc-400 font-normal">(1 gauza = 36&quot;)</span>
                    </label>
                    <div className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                      {fabric.gauzaNeeded.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                      Fabric Width <span className="text-zinc-400 font-normal">(inch)</span>
                    </label>
                    <select
                      value={fabric.fabricWidth}
                      onChange={(e) => setFabric((prev: FabricDetails) => ({ ...prev, fabricWidth: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    >
                      {FABRIC_WIDTH_OPTIONS.map((width) => (
                        <option key={width} value={width}>
                          {width} inch
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                    Price per Gauza <span className="text-zinc-400 font-normal">(NPR)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">NPR</span>
                    <input
                      type="number"
                      value={fabricPrice}
                      onChange={(e) => setFabricPrice(Number(e.target.value))}
                      className="w-full pl-14 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <ImageAnalyzer
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            )}
          </div>

          <AccessoriesInput
            accessories={accessories}
            setAccessories={setAccessories}
          />

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-8 animate-fade-in delay-200">
            <h2 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-zinc-100">
              Labor & Overhead
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Labor Rate', value: laborRate, setter: setLaborRate, suffix: 'NPR' },
                { label: 'Units', value: laborUnits, setter: setLaborUnits, suffix: '' },
                { label: 'Master Charge', value: masterChargeRs, setter: setMasterChargeRs, suffix: 'NPR' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-medium mb-2.5 text-zinc-700 dark:text-zinc-300">
                    {field.label} {field.suffix && <span className="text-zinc-400 font-normal">({field.suffix})</span>}
                  </label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.setter(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in delay-300">
            <button
              onClick={handleSaveToHistory}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save to History
            </button>
            <button
              onClick={handleSaveAsTemplate}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-medium rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Save as Template
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <CostBreakdown
            fabricCost={fabricCost}
            accessoriesCost={accessoriesCost}
            laborCost={laborCost}
            masterCharge={masterCharge}
            totalCP={totalCP}
            fabricDetails={fabric}
            gauzaPrice={fabricPrice}
          />
        </div>
      </div>
    </div>
  );
}
