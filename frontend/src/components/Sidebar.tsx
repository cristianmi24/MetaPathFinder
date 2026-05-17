import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, BarChart3, TestTube2, Settings, FileText, Compass, LogOut, User, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';

export function Sidebar() {
  const role = useCognitiveStore((s) => s.role);
  const reset = useCognitiveStore((s) => s.reset);
  const isCollapsed = useCognitiveStore((s) => s.isSidebarCollapsed);
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboards', path: '/admin', roles: ['admin'] },
    { icon: Users, label: 'Usuarios Registrados', path: '/registered-users', roles: ['admin'] },
    { icon: User, label: 'Mi Perfil', path: '/profile', roles: ['student'] },
    { icon: GraduationCap, label: 'Tutorial', path: '/tutorial', roles: ['student'] },
    { icon: BarChart3, label: 'Analíticas', path: '/analytics', roles: ['student'] },
    { icon: TestTube2, label: 'Experimentos', path: '/experiments', roles: ['admin'] },
  ];

  const filteredItems = navItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  const footerItems = [
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-full bg-surface-container rounded-r-3xl shadow-md z-40 py-6 flex flex-col hidden lg:flex transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("px-4 mb-10 flex items-center gap-4 transition-all", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <h1 className="font-bold text-primary tracking-tight leading-none">Meta-Pathfinder</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">
              {role === 'student' ? 'Estudiante' : 'Administrador'}
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 px-3">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-full transition-all group relative overflow-hidden",
                isCollapsed ? "justify-center px-0 w-12 mx-auto" : "",
                isActive 
                  ? "bg-primary-container text-on-primary-container font-semibold" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm overflow-hidden whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 px-3 pt-6 border-t border-outline-variant/30">
        {footerItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-full transition-all",
                isCollapsed ? "justify-center px-0 w-12 mx-auto" : "",
                isActive 
                  ? "bg-primary-container text-on-primary-container font-semibold" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm overflow-hidden whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
        <button
          onClick={() => { reset(); navigate('/'); }}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-full transition-all text-on-surface-variant hover:bg-surface-container-highest w-full text-left",
            isCollapsed ? "justify-center px-0 w-12 mx-auto" : ""
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm overflow-hidden whitespace-nowrap">Cerrar Sesión</span>}
        </button>
      </div>
    </nav>
  );
}
