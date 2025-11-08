import { NavLink } from 'react-router-dom';
import { Bot, Home, Zap, Users, Target, Phone, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: <Home className="h-4 w-4" />, label: 'Dashboard' },
    { to: '/dashboard/connections', icon: <Zap className="h-4 w-4" />, label: 'Connections' },
    { to: '/dashboard/agents', icon: <Bot className="h-4 w-4" />, label: 'Agents' },
    { to: '/dashboard/leads', icon: <Users className="h-4 w-4" />, label: 'Leads' },
    { to: '/dashboard/campaigns', icon: <Target className="h-4 w-4" />, label: 'Campaigns' },
    { to: '/dashboard/reports', icon: <BarChart2 className="h-4 w-4" />, label: 'Reports' },
  ];

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold font-display">
            <Bot className="h-6 w-6" />
            <span className="">AuraCall</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
