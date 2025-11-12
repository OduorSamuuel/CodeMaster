"use client";

import React, { useState } from 'react';
import { 
  Home, Code, Trophy, Target, Zap, BookOpen, Users, 
  Settings, Bell, Search, Flame, Star, Crown, Sparkles,
  ChevronLeft, ChevronRight, Menu, X, Award, TrendingUp,
  Rocket, Brain, Heart, Shield, Swords, Map,
  MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutUserData } from '@/types';

type UserLayoutClientProps = {
  children: React.ReactNode;
  userData: LayoutUserData;
  inProgressCount: number;
};

const UserLayoutClient = ({ children, userData, inProgressCount }: UserLayoutClientProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', badge: null, color: 'text-blue-500' },
    { 
      icon: Code, 
      label: 'Challenges', 
      href: '/challenges', 
      badge: inProgressCount > 0 ? inProgressCount.toString() : null, 
      color: 'text-green-500' 
    },
    { icon: Trophy, label: 'Achievements', href: '/achievements', badge: null, color: 'text-yellow-500' },
    { icon: TrendingUp, label: 'Leaderboard', href: '/leaderboard', badge: null, color: 'text-orange-500' },
  ];

  const bottomNavItems = [
    { icon: Settings, label: 'Profile', href: '/profile' },
  ];

  const xpPercentage = (userData.currentXP / userData.xpToNextLevel) * 100;

  // Check if avatar is an image URL or emoji
  const isImageAvatar = userData.avatar?.startsWith('http') || userData.avatar?.startsWith('data:');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  CodeMaster
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Level Up!</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* User Stats Card */}
        {!sidebarCollapsed && (
          <div className="p-4 m-4 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-300 dark:border-slate-700 backdrop-blur-sm shadow-lg dark:shadow-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                  {isImageAvatar ? (
                    <Image
                      src={userData.avatar}
                      alt="User Avatar"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{userData.avatar || '👤'}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{userData.name}</p>
                <div className="flex items-center gap-1">
                  <Badge className={`text-white border-0 text-xs px-2 py-0 shadow-md ${
                    userData.rank === 'Platinum' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                    userData.rank === 'Diamond' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' :
                    userData.rank === 'Gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    userData.rank === 'Silver' ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-orange-700 to-orange-800'
                  }`}>
                    {userData.rank}
                  </Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Rank</span>
                </div>
              </div>
            </div>
            
            {/* XP Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Level {userData.level}
                </span>
                <span className="text-slate-600 dark:text-slate-400">{userData.currentXP}/{userData.xpToNextLevel} XP</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Streak & Currency */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-lg p-2 text-center shadow-sm">
                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">{userData.streak}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Streak</p>
              </div>
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-lg p-2 text-center shadow-sm">
                <div className="text-yellow-500 text-lg mb-1">🪙</div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{userData.coins}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Coins</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all" />
                <item.icon className={`w-5 h-5 ${item.color} relative z-10`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 font-medium relative z-10">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs relative z-10">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-all"
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>

          {/* Daily Bonus Card */}
          {!sidebarCollapsed && (
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 rounded-xl border border-purple-300 dark:border-purple-500/30 shadow-lg dark:shadow-none">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Daily Bonus!</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">Come back tomorrow for 2x XP</p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg">
                  Claim Reward
                </Button>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm dark:shadow-none">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left Side - Mobile Menu + Search */}
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-slate-600 dark:text-slate-400"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg px-4 py-2 flex-1 max-w-md border border-slate-200 dark:border-transparent">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search challenges, users..."
                  className="bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 w-full"
                />
                <kbd className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">⌘K</kbd>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-lg px-3 py-2 shadow-sm dark:shadow-none">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{userData.streak}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">day streak</span>
                </div>
                
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border shadow-sm ${
                  userData.rank === 'Platinum' ? 'bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 border-cyan-400 dark:border-cyan-500/30' :
                  userData.rank === 'Diamond' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 border-blue-400 dark:border-blue-500/30' :
                  userData.rank === 'Gold' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-500/20 dark:to-orange-500/20 border-yellow-400 dark:border-yellow-500/30' :
                  userData.rank === 'Silver' ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-500/20 dark:to-gray-600/20 border-gray-400 dark:border-gray-500/30' :
                  'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20 border-orange-400 dark:border-orange-500/30'
                }`}>
                  <Crown className={`w-4 h-4 ${
                    userData.rank === 'Platinum' ? 'text-cyan-500' :
                    userData.rank === 'Diamond' ? 'text-blue-500' :
                    userData.rank === 'Gold' ? 'text-yellow-500' :
                    userData.rank === 'Silver' ? 'text-gray-500' :
                    'text-orange-700'
                  }`} />
                  <span className={`text-sm font-bold ${
                    userData.rank === 'Platinum' ? 'text-cyan-600 dark:text-cyan-400' :
                    userData.rank === 'Diamond' ? 'text-blue-600 dark:text-blue-400' :
                    userData.rank === 'Gold' ? 'text-yellow-600 dark:text-yellow-400' :
                    userData.rank === 'Silver' ? 'text-gray-600 dark:text-gray-400' :
                    'text-orange-700 dark:text-orange-400'
                  }`}>{userData.rank}</span>
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* Avatar (Mobile) */}
              <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg overflow-hidden">
                {isImageAvatar ? (
                  <Image
                    src={userData.avatar}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm">{userData.avatar || '👤'}</span>
                )}
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-10">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default UserLayoutClient;