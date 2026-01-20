import { NavLink, useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import shopConfig from '@root/barbershop.json';
import { useState } from 'react';
import { LayoutDashboard, Users, CalendarDays, Settings, Scissors, Calendar, Menu, X } from 'lucide-react';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden border border-primary/20">
                        <img src={shopConfig.theme.dark} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold">{shopConfig.name}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-accent rounded-lg"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/20">
                            <img src={shopConfig.theme.dark} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{shopConfig.name}</h1>
                            <span className="text-xs text-muted-foreground">Painel Admin</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 hover:bg-accent rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setIsMobileMenuOpen(false)}
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
            <main className="flex-1 overflow-auto h-[calc(100vh-65px)] md:h-screen">
                {children}
            </main>
        </div>
    );
}
