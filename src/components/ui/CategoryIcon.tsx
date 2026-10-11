import type { Category } from '@/types';
import {
  Utensils,
  Bus,
  GraduationCap,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Clapperboard,
  Package,
  type LucideIcon,
} from 'lucide-react';

const categoryIcons: Record<Category, LucideIcon> = {
  Food: Utensils,
  Transport: Bus,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Health: HeartPulse,
  Entertainment: Clapperboard,
  Other: Package,
};

export function CategoryIcon({ category, size = 18 }: { category: Category; size?: number }) {
  const Icon = categoryIcons[category];
  return <Icon size={size} />;
}

export function getCategoryIcon(category: Category): LucideIcon {
  return categoryIcons[category];
}
