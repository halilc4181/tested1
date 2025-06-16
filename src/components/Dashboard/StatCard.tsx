import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  name: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'increase' | 'decrease';
  color: 'emerald' | 'blue' | 'amber' | 'purple';
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    change: 'text-emerald-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    change: 'text-blue-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    change: 'text-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    change: 'text-purple-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  name,
  value,
  icon: Icon,
  change,
  changeType,
  color,
}) => {
  const colors = colorMap[color];

  return (
    <div className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-900/5 rounded-xl">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {name}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                <div className={`ml-2 flex text-sm ${colors.change}`}>
                  <span>{change}</span>
                  <span className="ml-1">geçen aya göre</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};