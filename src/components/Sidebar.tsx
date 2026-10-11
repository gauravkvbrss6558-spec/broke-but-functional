import {
  LayoutDashboard,
  Zap,
  Receipt,
  Calendar,
  Target,
  Activity,
  Moon,
  Sun,
  Menu,
  X,
  Wallet,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export type ViewKey = 'dashboard' | 'simulator' | 'transactions' | 'commitments' | 'savings' | 'forecast' | 'health';

interface NavItem {
  key: ViewKey;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview' },
  { key: 'simulator', label: 'Simulator', icon: Zap, description: 'Test decisions' },
  { key: 'transactions', label: 'Transactions', icon: Receipt, description: 'Income & expenses' },
  { key: 'commitments', label: 'Commitments', icon: Calendar, description: 'Bills & subscriptions' },
  { key: 'savings', label: 'Savings', icon: Target, description: 'Goals' },
  { key: 'forecast', label: 'Forecast', icon: Activity, description: '30-day projection' },
  { key: 'health', label: 'Health', icon: Activity, description: 'Risk & score' },
];

interface SidebarProps {
  current: ViewKey;
  onNavigate: (view: ViewKey) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onReset: () => void;
}

export function Sidebar({ current, onNavigate, theme, onToggleTheme, onReset }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleNav = (view: ViewKey) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-700 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
            <Wallet size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">Broke But Functional</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">Make it to Day 30</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-navy-900 border-r border-gray-100 dark:border-navy-700 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-navy-700">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Navigation</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto scrollbar-thin p-3">
              {navItems.map((item) => (
                <NavButton key={item.key} item={item} active={current === item.key} onClick={() => handleNav(item.key)} />
              ))}
            </nav>
            <div className="p-3 border-t border-gray-50 dark:border-navy-700">
              <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={() => setShowReset(true)} className="w-full justify-start">
                Reset to demo data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white dark:bg-navy-900 border-r border-gray-100 dark:border-navy-700 z-20">
        <div className="p-5 border-b border-gray-50 dark:border-navy-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Wallet size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Broke But Functional</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Make it to Day 30</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {navItems.map((item) => (
            <NavButton key={item.key} item={item} active={current === item.key} onClick={() => handleNav(item.key)} />
          ))}
        </nav>

        <div className="p-3 border-t border-gray-50 dark:border-navy-700 space-y-1">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-700 dark:text-gray-400 transition-colors"
          >
            <RotateCcw size={18} />
            Reset to demo data
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={showReset}
        title="Reset all data?"
        message="This will replace your current data with the original demo budget. This cannot be undone."
        confirmLabel="Reset"
        danger
        onConfirm={() => {
          onReset();
          setShowReset(false);
        }}
        onCancel={() => setShowReset(false)}
      />
    </>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        active
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-700',
      ].join(' ')}
    >
      <Icon size={18} className={active ? '' : 'text-gray-400 dark:text-gray-500'} />
      <div className="flex-1 text-left">
        <div className="leading-none">{item.label}</div>
        <div className={`text-[10px] mt-0.5 ${active ? 'text-emerald-500/70 dark:text-emerald-500/60' : 'text-gray-400 dark:text-gray-600'}`}>
          {item.description}
        </div>
      </div>
      {active && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
    </button>
  );
}
