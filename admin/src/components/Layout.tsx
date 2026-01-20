import { NavLink, useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import shopConfig from '@root/barbershop.json';
import { LayoutDashboard, Users, CalendarDays, Settings, Scissors, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: Calendar, label: 'Calendário' },
    { to: '/barbers', icon: Users, label: 'Barbeiros' },
    { to: '/appointments', icon: CalendarDays, label: 'Agendamentos' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/20">
                            <img src={shopConfig.theme.dark} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{shopConfig.name}</h1>
                            <span className="text-xs text-muted-foreground">Painel Admin</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                )
                            }
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className={cn(
                        'px-3 py-2 rounded-lg text-xs',
                        isSupabaseConfigured ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    )}>
                        {isSupabaseConfigured ? '✓ Supabase conectado' : '⚠ Modo demo (sem banco)'}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
