import type { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {Icon && <Icon size={18} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="badge badge-primary ml-1 py-0 px-2">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
