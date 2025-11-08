'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Lock, 
  Unlock,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChallengeData } from '@/actions/admin-challenges';

interface ChallengesListClientProps {
  challenges: ChallengeData[];
  currentPage: number;
  totalPages: number;
  total: number;
  initialSearch: string;
  initialCategory: string;
  initialDifficulty: string;
}

export default function ChallengesListClient({
  challenges,
  currentPage,
  totalPages,
  total,
  initialSearch,
  initialCategory,
  initialDifficulty
}: ChallengesListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [difficultyFilter, setDifficultyFilter] = useState(initialDifficulty);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateFilters = (search?: string, category?: string, difficulty?: string) => {
    const params = new URLSearchParams(window.location.search);
    
    if (search !== undefined) {
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
    }
    
    if (category !== undefined) {
      if (category && category !== 'all') {
        params.set('category', category);
      } else {
        params.delete('category');
      }
    }
    
    if (difficulty !== undefined) {
      if (difficulty && difficulty !== 'all') {
        params.set('difficulty', difficulty);
      } else {
        params.delete('difficulty');
      }
    }
    
    params.delete('page');
    
    startTransition(() => {
      router.push(`/admin/challenges?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(searchQuery, categoryFilter, difficultyFilter);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    updateFilters(searchQuery, value, difficultyFilter);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
    updateFilters(searchQuery, categoryFilter, value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    startTransition(() => {
      router.push('/admin/challenges');
    });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/admin/challenges?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!challengeToDelete) return;
    
    setIsDeleting(true);
    try {
      const { deleteChallenge } = await import('@/actions/admin-challenges');
      const result = await deleteChallenge(challengeToDelete);
      
      if (result.success) {
        toast.success('Challenge deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete challenge');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setChallengeToDelete(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      '8 kyu': 'bg-green-500/10 text-green-500 border-green-500/20',
      '7 kyu': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      '6 kyu': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      '5 kyu': 'bg-red-500/10 text-red-500 border-red-500/20',
      '4 kyu': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return colors[difficulty] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all';

  // Get unique categories from challenges
  const categories = Array.from(new Set(challenges.map(c => c.category)));

  return (
    <>
      {/* Filters */}
      <div className="space-y-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges by name or description..."
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
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="reference">Reference</SelectItem>
              <SelectItem value="algorithms">Algorithms</SelectItem>
              <SelectItem value="fundamentals">Fundamentals</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="8 kyu">8 kyu (Easiest)</SelectItem>
              <SelectItem value="7 kyu">7 kyu</SelectItem>
              <SelectItem value="6 kyu">6 kyu</SelectItem>
              <SelectItem value="5 kyu">5 kyu</SelectItem>
              <SelectItem value="4 kyu">4 kyu (Hardest)</SelectItem>
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

      {/* Challenges List */}
      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold mb-2">No challenges found</p>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first challenge to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold truncate">{challenge.name}</h3>
                  <Badge variant="outline" className={getDifficultyColor(challenge.rank_name)}>
                    {challenge.rank_name}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {challenge.category}
                  </Badge>
                  {challenge.is_locked && (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{challenge.points} points</span>
                  <span>•</span>
                  <span>{challenge.solved_count} solves</span>
                  {challenge.time_limit && (
                    <>
                      <span>•</span>
                      <span>{challenge.time_limit}s limit</span>
                    </>
                  )}
                  {challenge.tags && challenge.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{challenge.tags.slice(0, 3).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/admin/challenges/${challenge.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/admin/challenges/${challenge.id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {challenge.is_locked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Lock
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      setChallengeToDelete(challenge.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)} of {total} challenges
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
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this challenge? This action cannot be undone.
              All test cases and user submissions will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Challenge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}