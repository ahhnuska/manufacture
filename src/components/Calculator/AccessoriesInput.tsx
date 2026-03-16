'use client';

import { Accessories, AccessoryItem } from '../../lib/types';

interface AccessoriesInputProps {
  accessories: Accessories;
  setAccessories: React.Dispatch<React.SetStateAction<Accessories>>;
}

type SingleAccessoryKey = 'chains' | 'buckles' | 'dLocks' | 'gum' | 'flaps';

const accessoryIcons: Record<SingleAccessoryKey, string> = {
  chains: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  buckles: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  dLocks: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  gum: 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.514M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495',
  flaps: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
};

export default function AccessoriesInput({ accessories, setAccessories }: AccessoriesInputProps) {
  const updateSingleAccessory = (
    key: SingleAccessoryKey,
    field: keyof AccessoryItem,
    value: boolean | number | string
  ) => {
    setAccessories(prev => {
      const item = prev[key] as AccessoryItem;
      const newItem = { ...item, [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        newItem.total = newItem.quantity * newItem.unitPrice;
      }
      
      return { ...prev, [key]: newItem };
    });
  };

  const updateOtherAccessory = (index: number, field: keyof AccessoryItem, value: boolean | number | string) => {
    setAccessories(prev => {
      const others = [...prev.others];
      const item = { ...others[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        item.total = item.quantity * item.unitPrice;
      }
      
      others[index] = item;
      return { ...prev, others };
    });
  };

  const addOtherAccessory = () => {
    setAccessories(prev => ({
      ...prev,
      others: [...prev.others, { enabled: true, name: '', quantity: 0, unitPrice: 0, costPrice: 0, total: 0 }],
    }));
  };

  const removeOtherAccessory = (index: number) => {
    setAccessories(prev => ({
      ...prev,
      others: prev.others.filter((_, i) => i !== index),
    }));
  };

  const renderAccessoryRow = (
    key: SingleAccessoryKey,
    label: string,
    showLength = false
  ) => {
    const item = accessories[key];
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${item.enabled ? 'bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50' : 'bg-zinc-50/50 dark:bg-zinc-800/25 border border-zinc-100/50 dark:border-zinc-700/25'}`}>
        <input
          type="checkbox"
          checked={item.enabled}
          onChange={(e) => updateSingleAccessory(key, 'enabled', e.target.checked)}
          className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
        />
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
          <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={accessoryIcons[key]} />
          </svg>
        </div>
        <span className="w-20 sm:w-24 font-medium text-zinc-700 dark:text-zinc-300 text-sm">{label}</span>
        {showLength ? (
          <input
            type="number"
            placeholder="Length (inch)"
            value={item.quantity || ''}
            onChange={(e) => updateSingleAccessory(key, 'quantity', Number(e.target.value))}
            disabled={!item.enabled}
            className="flex-1 sm:flex-none sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        ) : (
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity || ''}
            onChange={(e) => updateSingleAccessory(key, 'quantity', Number(e.target.value))}
            disabled={!item.enabled}
            className="w-14 sm:w-16 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        )}
        <input
          type="number"
          placeholder="Price"
          value={item.unitPrice || ''}
          onChange={(e) => updateSingleAccessory(key, 'unitPrice', Number(e.target.value))}
          disabled={!item.enabled}
          className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
        <input
          type="number"
          placeholder="Cost"
          value={item.costPrice || ''}
          onChange={(e) => updateSingleAccessory(key, 'costPrice', Number(e.target.value))}
          disabled={!item.enabled}
          className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 p-6 sm:p-8 animate-fade-in delay-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Accessories</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Add hardware and additional materials</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {renderAccessoryRow('chains', 'Chains', true)}
        {renderAccessoryRow('buckles', 'Buckles')}
        {renderAccessoryRow('dLocks', 'D-Locks')}
        {renderAccessoryRow('gum', 'Gum/Elastic', true)}
        {renderAccessoryRow('flaps', 'Flaps')}

        {accessories.others.map((item, index) => (
          <div key={index} className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${item.enabled ? 'bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50' : 'bg-zinc-50/50 dark:bg-zinc-800/25 border border-zinc-100/50 dark:border-zinc-700/25'}`}>
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => updateOtherAccessory(index, 'enabled', e.target.checked)}
              className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
            />
            <input
              type="text"
              placeholder="Name"
              value={item.name}
              onChange={(e) => updateOtherAccessory(index, 'name', e.target.value)}
              disabled={!item.enabled}
              className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity || ''}
              onChange={(e) => updateOtherAccessory(index, 'quantity', Number(e.target.value))}
              disabled={!item.enabled}
              className="w-14 sm:w-16 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.unitPrice || ''}
              onChange={(e) => updateOtherAccessory(index, 'unitPrice', Number(e.target.value))}
              disabled={!item.enabled}
              className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <input
              type="number"
              placeholder="Cost"
              value={item.costPrice || ''}
              onChange={(e) => updateOtherAccessory(index, 'costPrice', Number(e.target.value))}
              disabled={!item.enabled}
              className="w-20 sm:w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <button
              onClick={() => removeOtherAccessory(index)}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={addOtherAccessory}
          className="w-full py-3.5 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all duration-200"
        >
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Other Accessory
          </span>
        </button>
      </div>
    </div>
  );
}
