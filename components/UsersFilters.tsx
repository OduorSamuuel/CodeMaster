'use client';

import React, { useState, useTransition } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';

interface UsersFiltersProps {
  initialSearch?: string;
  initialRole?: string;
  initialStatus?: string;
}

export default function UsersFilters({ 
  initialSearch = '', 
  initialRole = 'all',
  initialStatus = 'all'
}: UsersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const updateFilters = (search?: string, role?: string, status?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search
    if (search !== undefined) {
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
    }
    
    // Update role
    if (role !== undefined) {
      if (role && role !== 'all') {
        params.set('role', role);
      } else {
        params.delete('role');
      }
    }
    
    // Update status
    if (status !== undefined) {
      if (status && status !== 'all') {
        params.set('status', status);
      } else {
        params.delete('status');
      }
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    startTransition(() => {
      router.push(`/admin/users/all?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(searchQuery, roleFilter, statusFilter);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    updateFilters(searchQuery, value, statusFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateFilters(searchQuery, roleFilter, value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    startTransition(() => {
      router.push('/admin/users/all');
    });
  };

  const hasActiveFilters = searchQuery || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}

        {isPending && (
          <span className="text-sm text-muted-foreground">Updating...</span>
        )}
      </div>
    </div>
  );
}