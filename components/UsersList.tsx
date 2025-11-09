'use client';

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Crown, Edit2, Eye, MoreVertical, Shield, UserIcon, Ban, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { UserManagementData } from '@/actions/admin-users';
import { updateUserRole, toggleUserBan, deleteUser } from '@/actions/admin-users';
import { toast } from 'sonner';

// Client-side helper function for relative time formatting
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

interface UsersListProps {
  users: UserManagementData[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function UsersList({ users, currentPage, totalPages, total }: UsersListProps) {
  const router = useRouter();
  
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'delete' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const RoleBadge = ({ role }: { role: string }) => {
    const colors = {
      admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      moderator: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      user: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    
    const icons = {
      admin: Crown,
      moderator: Shield,
      user: UserIcon
    };
    
    const Icon = icons[role as keyof typeof icons];
    
    return (
      <Badge variant="outline" className={colors[role as keyof typeof colors]}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    setIsLoading(true);
    const result = await updateUserRole(userId, newRole);
    setIsLoading(false);

    if (result.success) {
      toast.success("Role Updated", {
        description: `User role has been changed to ${newRole}`,
      });
      router.refresh();
    } else {
      toast.error("Error", {
      
        description: result.error || "Failed to update role",
      });
    }
  };

  const handleBanAction = async () => {
    if (!actionUserId) return;
    
    setIsLoading(true);
    const result = await toggleUserBan(
      actionUserId, 
      actionType === 'ban',
      actionType === 'ban' ? 'Banned by administrator' : undefined
    );
    setIsLoading(false);

    if (result.success) {
      toast.success(actionType === 'ban' ? "User Banned" : "User Unbanned", {
        description: `User has been ${actionType === 'ban' ? 'banned' : 'unbanned'} successfully`,
      });
      router.refresh();
    } else {
      toast.error("Error", {
        description: result.error || "Failed to update ban status",
      });
    }

    setActionUserId(null);
    setActionType(null);
  };

  const handleDeleteAction = async () => {
    if (!actionUserId) return;
    
    setIsLoading(true);
    const result = await deleteUser(actionUserId);
    setIsLoading(false);

    if (result.success) {
      toast.success("User Deleted", {
        description: "User account has been deleted",
      });
      router.refresh();
    } else {
      toast.error("Error", {
        description: result.error || "Failed to delete user",
      });
    }

    setActionUserId(null);
    setActionType(null);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/admin/users/all?${params.toString()}`);
  };

  return (
    <>
      <div className="space-y-3">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.avatar || user.username.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold truncate">{user.username}</h3>
                  <RoleBadge role={user.role} />
                  <Badge 
                    variant={user.status === 'active' ? 'default' : 'secondary'} 
                    className={`text-xs ${user.is_banned ? 'bg-red-500' : ''}`}
                  >
                    {user.is_banned ? 'Banned' : user.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span>Level {user.level}</span>
                  <span>•</span>
                  <span>{user.total_points.toLocaleString()} XP</span>
                  <span>•</span>
                  <span>{user.streak} day streak</span>
                  <span>•</span>
                  <span>{user.total_solved} solved</span>
                  <span>•</span>
                  <span className="hidden sm:inline">
                    Active {formatRelativeTime(user.lastActive)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" title="View Details">
                <Eye className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Change Role
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(user.id, 'user')}
                    disabled={user.role === 'user'}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Make User
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(user.id, 'moderator')}
                    disabled={user.role === 'moderator'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Make Moderator
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(user.id, 'admin')}
                    disabled={user.role === 'admin'}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Make Admin
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {!user.is_banned ? (
                    <DropdownMenuItem 
                      className="text-orange-600"
                      onClick={() => {
                        setActionUserId(user.id);
                        setActionType('ban');
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      className="text-green-600"
                      onClick={() => {
                        setActionUserId(user.id);
                        setActionType('unban');
                      }}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Unban User
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      setActionUserId(user.id);
                      setActionType('delete');
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, total)} of {total} users
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={actionType === 'ban' || actionType === 'unban'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'ban' ? 'Ban User' : 'Unban User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'ban' 
                ? 'Are you sure you want to ban this user? They will no longer be able to access the platform.'
                : 'Are you sure you want to unban this user? They will regain access to the platform.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBanAction}
              disabled={isLoading}
              className={actionType === 'ban' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionType === 'delete'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              The user's account and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAction}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}