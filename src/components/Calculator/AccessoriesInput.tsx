'use client';

import type { Dispatch, SetStateAction } from 'react';
import { AccessoryRow, CostMode } from '../../lib/types';
import { calculateAccessoryRow, createAccessoryRow } from '../../lib/calculator';

interface AccessoriesInputProps {
  accessoryRows: AccessoryRow[];
  setAccessoryRows: Dispatch<SetStateAction<AccessoryRow[]>>;
}

const modeLabels: Record<CostMode, string> = {
  quantity: 'Quantity',
  weight: 'Weight',
};

export default function AccessoriesInput({
  accessoryRows,
  setAccessoryRows,
}: AccessoriesInputProps) {
  const updateRow = (
    id: string,
    field: keyof AccessoryRow,
    value: number | string
  ) => {
    setAccessoryRows((current) =>
      current.map((row) =>
        row.id === id
          ? calculateAccessoryRow({
              ...row,
              [field]: value,
            })
          : row
      )
    );
  };

  const updateMode = (id: string, costMode: CostMode) => {
    setAccessoryRows((current) =>
      current.map((row) =>
        row.id === id ? calculateAccessoryRow({ ...row, costMode }) : row
      )
    );
  };

  const addRow = () => {
    setAccessoryRows((current) => [...current, createAccessoryRow('Accessory')]);
  };

  const removeRow = (id: string) => {
    setAccessoryRows((current) => current.filter((row) => row.id !== id));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-8 animate-fade-in delay-100">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Accessories</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Add hardware by quantity or by weight
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium"
        >
          Add Accessory
        </button>
      </div>

      <div className="space-y-4">
        {accessoryRows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="text"
                value={row.name}
                onChange={(event) => updateRow(row.id, 'name', event.target.value)}
                placeholder="Accessory name"
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex gap-2">
                {(['quantity', 'weight'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateMode(row.id, mode)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      row.costMode === mode
                        ? 'bg-amber-600 text-white'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {modeLabels[mode]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Remove
                </button>
              </div>
            </div>

            {row.costMode === 'quantity' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Quantity per bag
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={row.quantityUsedPerBag || ''}
                    onChange={(event) =>
                      updateRow(row.id, 'quantityUsedPerBag', Number(event.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Price per piece
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={row.unitPrice || ''}
                    onChange={(event) =>
                      updateRow(row.id, 'unitPrice', Number(event.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Cost per bag</div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                    NPR {row.total.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Purchase weight
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={row.purchaseWeight || ''}
                    onChange={(event) =>
                      updateRow(row.id, 'purchaseWeight', Number(event.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Purchase price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={row.purchasePrice || ''}
                    onChange={(event) =>
                      updateRow(row.id, 'purchasePrice', Number(event.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Weight used per bag
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={row.weightUsedPerBag || ''}
                    onChange={(event) =>
                      updateRow(row.id, 'weightUsedPerBag', Number(event.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Rate / weight unit
                  </div>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200 font-mono">
                    NPR {row.pricePerWeightUnit.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Cost per bag
                  </div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                    NPR {row.total.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
