import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, BarChart3, TestTube2, Settings, FileText, Compass, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';

export function Sidebar() {
  const role = useCognitiveStore((s) => s.role);
  const reset = useCognitiveStore((s) => s.reset);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboards', path: '/', roles: ['admin'] },
    { icon: User, label: 'Mi Perfil', path: '/', roles: ['student'] },
    { icon: GraduationCap, label: 'Evaluaciones', path: '/evaluations', roles: ['student'] },
    { icon: BarChart3, label: 'Analíticas', path: '/analytics', roles: ['student'] },
    { icon: TestTube2, label: 'Experimentos', path: '/experiments', roles: ['admin'] },
  ];

  const filteredItems = navItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  const footerItems = [
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-surface-container rounded-r-3xl shadow-md z-40 py-6 flex flex-col hidden lg:flex">
      <div className="px-6 mb-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-primary tracking-tight leading-none">Meta-Pathfinder</h1>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">
            {role === 'student' ? 'Estudiante' : 'Administrador'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-3">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-full transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-primary-container text-on-primary-container font-semibold" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 px-3 pt-6 border-t border-outline-variant/30">
        {footerItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-full transition-all",
                isActive 
                  ? "bg-primary-container text-on-primary-container font-semibold" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
