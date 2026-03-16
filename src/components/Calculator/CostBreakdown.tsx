'use client';

import { FabricDetails } from '../../lib/types';

interface CostBreakdownProps {
  fabricCost: number;
  accessoriesCost: number;
  laborCost: number;
  masterCharge: number;
  totalCP: number;
  fabricDetails: FabricDetails;
  gauzaPrice: number;
}

export default function CostBreakdown({
  fabricCost,
  accessoriesCost,
  laborCost,
  masterCharge,
  totalCP,
  fabricDetails,
  gauzaPrice,
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Cost Breakdown
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time calculation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fabric</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Dimensions:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{fabricDetails.length}&quot; × {fabricDetails.width}&quot; × {fabricDetails.height}&quot;</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Wastage:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{fabricDetails.wastagePercent}%</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Fabric Width:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{fabricDetails.fabricWidth}"</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Gauza needed:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{fabricDetails.gauzaNeeded.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Rate:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">NPR {gauzaPrice}/gauza</span>
            </div>
            <div className="flex justify-between pt-2.5 mt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fabric Cost:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">NPR {fabricCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Accessories</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">NPR {accessoriesCost.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Labor</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">NPR {laborCost.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Master Charge</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">NPR {masterCharge.toFixed(2)}</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-200/60 dark:border-amber-800/60">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Total Cost Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-700 dark:text-amber-300 font-mono tracking-tight">
                NPR {totalCP.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 text-center pt-2">
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            1 Gauza = 36 inches (standard Nepali measurement)
          </span>
        </div>
      </div>
    </div>
  );
}
