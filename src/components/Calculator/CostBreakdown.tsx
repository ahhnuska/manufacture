'use client';

import { AccessoryRow, FabricGroup } from '../../lib/types';

interface CostBreakdownProps {
  fabricGroups: FabricGroup[];
  accessoryRows: AccessoryRow[];
  fabricCost: number;
  accessoriesCost: number;
  laborCost: number;
  masterCharge: number;
  totalCP: number;
}

export default function CostBreakdown({
  fabricGroups,
  accessoryRows,
  fabricCost,
  accessoriesCost,
  laborCost,
  masterCharge,
  totalCP,
}: CostBreakdownProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 p-6 sticky top-24 animate-fade-in delay-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Cost Breakdown</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Real-time totals</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Fabric Groups</h3>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              NPR {fabricCost.toFixed(2)}
            </span>
          </div>
          <div className="space-y-3">
            {fabricGroups.map((group) => (
              <div key={group.id} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {group.name || 'Untitled Fabric'}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {group.parts.length} parts • {group.fabricWidthInInches}&quot; width
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                      NPR {group.totalCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {group.purchaseUnitsNeeded.toFixed(2)} {group.purchaseUnit}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <div>Length needed: {group.requiredLengthInInches.toFixed(2)}&quot;</div>
                  <div>Products / unit: {group.productsPerPurchaseUnit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Accessories</h3>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              NPR {accessoriesCost.toFixed(2)}
            </span>
          </div>
          <div className="space-y-2 mt-3">
            {accessoryRows.map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {row.name || 'Accessory'} ({row.costMode})
                </span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">
                  NPR {row.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Labor</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">NPR {laborCost.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Master Charge</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">NPR {masterCharge.toFixed(2)}</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-200/60 dark:border-amber-800/60">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Total Cost Price</span>
          <div className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-300 font-mono tracking-tight">
            NPR {totalCP.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
