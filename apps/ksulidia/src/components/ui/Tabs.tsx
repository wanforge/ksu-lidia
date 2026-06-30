"use client";

import { IconType } from "react-icons";
import cn from "@core/utils/class-names";

export type TabItem = {
  id: string;
  label: string;
  icon?: IconType;
  badge?: string | number;
};

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-gray-200 px-3",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition",
              isActive
                ? "border-red-700 text-red-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
