'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  Code, 
  Settings, 
  Bell,
  Menu,
  X,
  Crown,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,  
  DropdownMenuLabel, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { AdminStats, getAdminStats, getAdminUserInfo } from '@/actions';


interface NavigationItem {
  label: string;
  href: string;
  icon: any;
  badge: number | null;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface AdminLayoutClientProps {
  initialStats?: AdminStats | null;
  initialUserInfo?: {
    email: string;
    username: string;
    role: string;
    avatar?: string;
    level?: number;
  } | null;
}

export default function AdminLayoutClient({ 
  initialStats,
  initialUserInfo 
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(initialStats || null);
  const [userInfo, setUserInfo] = useState(initialUserInfo || null);
  const [loading, setLoading] = useState(!initialStats);

  // Fetch stats on mount and periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, userInfoData] = await Promise.all([
          getAdminStats(),
          getAdminUserInfo()
        ]);
        
        if (statsData) setStats(statsData);
        if (userInfoData) setUserInfo(userInfoData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialStats || !initialUserInfo) {
      fetchData();
    }

    // Refresh stats every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [initialStats, initialUserInfo]);

  // Navigation items with dynamic badges
  const navigationItems: NavigationSection[] = [
    {
      title: 'Overview',
      items: [
        { 
          label: 'Dashboard', 
          href: '/admin/dashboard', 
          icon: LayoutDashboard,
          badge: null 
        },
      ]
    },
    {
      title: 'Content',
      items: [
        { 
          label: 'Create Challenge', 
          href: '/admin/challenges/create', 
          icon: Plus,
          badge: null 
        },
        { 
          label: 'Manage Challenges', 
          href: '/admin/challenges/manage', 
          icon: Code,
          badge: stats?.totalChallenges || null 
        },
      ]
    },
    {
      title: 'Users',
      items: [
        { 
          label: 'All Users', 
          href: '/admin/users/all', 
          icon: Users,
          badge: stats?.totalUsers || null 
        },
        { 
          label: 'Reports', 
          href: '/admin/users/reports', 
          icon: FileText,
          badge: stats?.pendingReports || null,
          badgeVariant: (stats?.pendingReports || 0) > 0 ? 'destructive' : 'secondary'
        },
      ]
    },
    {
      title: 'System',
      items: [
      
        { 
          label: 'Profile', 
          href: '/admin/profile', 
          icon: User,
          badge: null 
        }
      ]
    },
  ];

  // Update body padding when sidebar state changes
  useEffect(() => {
    const updatePadding = () => {
      if (typeof window !== 'undefined') {
        const mainContent = document.getElementById('admin-main-content');
        if (mainContent) {
          // Only apply on desktop
          if (window.innerWidth >= 768) {
            mainContent.style.paddingLeft = sidebarMinimized ? '4rem' : '16rem';
          } else {
            mainContent.style.paddingLeft = '0';
          }
        }
      }
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, [sidebarMinimized]);

  const getUserInitials = () => {
    if (!userInfo) return 'AD';
    return userInfo.username.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 mr-6">
            <Crown className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-lg hidden sm:inline-block">Admin Panel</span>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-sm font-semibold">
                  {loading ? '...' : stats?.activeUsers || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Today's Submissions</p>
                <p className="text-sm font-semibold">
                  {loading ? '...' : stats?.todaySubmissions || 0}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    {userInfo?.avatar && (
                      <AvatarImage src={userInfo.avatar} alt={userInfo.username} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">
                      {userInfo?.username || 'Admin User'}
                    </p>
                    <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20 h-5">
                      <Crown className="w-3 h-3 mr-1" />
                      {userInfo?.role || 'Admin'}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userInfo?.email || 'admin@example.com'}</p>
                    {userInfo?.level && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Level {userInfo.level}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" asChild>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="flex items-center w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-64px)] border-r bg-background transition-all duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarMinimized ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Minimize Toggle Button - Desktop Only */}
          <div className="hidden md:flex justify-end p-2 border-b">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              title={sidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              {sidebarMinimized ? (
                <Menu className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-6">
              {navigationItems.map((section) => (
                <div key={section.title}>
                  {!sidebarMinimized && (
                    <h3 className="mb-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            sidebarMinimized && "justify-center"
                          )}
                          title={sidebarMinimized ? item.label : undefined}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {!sidebarMinimized && <span className="truncate">{item.label}</span>}
                          </div>
                          {!sidebarMinimized && item.badge !== null && (
                            <Badge 
                              variant={item.badgeVariant || "secondary"} 
                              className="h-5 px-1.5 text-xs flex-shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}