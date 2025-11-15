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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Challenge } from '@/types';

interface ChallengesListClientProps {
  challenges: Challenge[];
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
  initialDifficulty,
}: ChallengesListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [difficultyFilter, setDifficultyFilter] = useState(initialDifficulty);

  // Loading states
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helpers
  const categories = Array.from(new Set(challenges.map(c => c.category)));

  const toggleLockStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      setActionLoading(challengeId);
      
      const { updateChallenge } = await import('@/actions');
      
      const result = await updateChallenge(challengeId, {
        is_locked: !currentStatus
      });
      
      if (result.success) {
        toast.success(`Challenge ${!currentStatus ? 'locked' : 'unlocked'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${!currentStatus ? 'lock' : 'unlock'} challenge`);
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error toggling lock status:', error);
    } finally {
      setActionLoading(null);
    }
  };

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
      router.push(`/admin/challenges/manage?${params.toString()}`);
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
    startTransition(() => router.push('/admin/challenges/manage'));
  };

  const goToPage = (page: number) => {
    setLoadingPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    
    startTransition(() => {
      router.push(`/admin/challenges/manage?${params.toString()}`);
    });
  };

  // Clear loading states when navigation completes
  React.useEffect(() => {
    if (!isPending) {
      setLoadingPage(null);
    }
  }, [isPending]);

  const handleDelete = async () => {
    if (!challengeToDelete) return;
    setIsDeleting(true);
    try {
      const { deleteChallenge } = await import('@/actions');
      const result = await deleteChallenge(challengeToDelete);
      if (result.success) {
        toast.success('Challenge deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete challenge');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setChallengeToDelete(null);
    }
  };

  const getDifficultyColor = (rank: string) => {
    const map: Record<string, string> = {
      '8 kyu': 'border-green-500/20 text-green-600',
      '7 kyu': 'border-yellow-500/20 text-yellow-600',
      '6 kyu': 'border-orange-500/20 text-orange-600',
      '5 kyu': 'border-red-500/20 text-red-600',
      '4 kyu': 'border-purple-500/20 text-purple-600',
    };
    return map[rank] || 'border-muted-foreground/20 text-muted-foreground';
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all';

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        end = 4;
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filters */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges by name or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={categoryFilter} onValueChange={handleCategoryChange} disabled={isPending}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={handleDifficultyChange} disabled={isPending}>
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay for Challenges List */}
        {isPending && (
          <div className="relative">
            <div className="space-y-3 opacity-50 pointer-events-none">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  {/* LEFT: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold truncate max-w-md">{challenge.name}</h3>
                      <Badge variant="outline" className={getDifficultyColor(challenge.rank_name!)}>
                        {challenge.rank_name}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {challenge.category}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{challenge.points} points</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{challenge.solved_count} solves</span>
                      {challenge.time_limit && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>{challenge.time_limit}s limit</span>
                        </>
                      )}
                      {challenge.tags?.length && challenge.tags.length > 0 && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate max-w-xs">
                            {challenge.tags?.slice(0, 3).join(', ')}
                            {challenge.tags && challenge.tags.length > 3 && '...'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Status Badge + Icons */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={challenge.is_locked ? 'secondary' : 'default'}
                      className={
                        !challenge.is_locked
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {challenge.is_locked ? 'Locked' : 'Active'}
                    </Badge>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled>
                        {challenge.is_locked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" disabled>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
              <div className="text-center p-6 bg-background border rounded-lg shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Loading challenges...</p>
                <p className="text-xs text-muted-foreground mt-1">Please wait</p>
              </div>
            </div>
          </div>
        )}

        {/* Challenges List */}
        {!isPending && challenges.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-lg font-semibold mb-2">No challenges found</p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first challenge'}
            </p>
          </div>
        ) : !isPending && (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* LEFT: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold truncate max-w-md">{challenge.name}</h3>
                    <Badge variant="outline" className={getDifficultyColor(challenge.rank_name!)}>
                      {challenge.rank_name}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {challenge.category}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{challenge.points} points</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{challenge.solved_count} solves</span>
                    {challenge.time_limit && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{challenge.time_limit}s limit</span>
                      </>
                    )}
                    {challenge.tags?.length && challenge.tags.length > 0 && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate max-w-xs">
                          {challenge.tags?.slice(0, 3).join(', ')}
                          {challenge.tags && challenge.tags.length > 3 && '...'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT: Status Badge + Icons */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={challenge.is_locked ? 'secondary' : 'default'}
                    className={
                      !challenge.is_locked
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {challenge.is_locked ? 'Locked' : 'Active'}
                  </Badge>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/challenges/${challenge.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/challenges/${challenge.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleLockStatus(challenge.id, challenge.is_locked)}
                          disabled={actionLoading === challenge.id}
                        >
                          {actionLoading === challenge.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : challenge.is_locked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          <span className="sr-only">
                            {challenge.is_locked ? 'Unlock' : 'Lock'}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {challenge.is_locked ? 'Unlock Challenge' : 'Lock Challenge'}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setChallengeToDelete(challenge.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 5) + 1}–{Math.min(currentPage * 5, total)} of {total} challenges
            </p>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => goToPage(currentPage - 1)}
                    className={currentPage <= 1 || isPending ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === -1 || page === -2 ? (
                      <span className="flex items-center justify-center h-9 w-9">...</span>
                    ) : (
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => goToPage(page)}
                        className="cursor-pointer "
                      >
                        {loadingPage === page && isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          page
                        )}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => goToPage(currentPage + 1)}
                    className={currentPage >= totalPages || isPending ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &nbsp;<strong>
                  {challengeToDelete && challenges.find(c => c.id === challengeToDelete)?.name}
                </strong>&nbsp;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-danger hover:bg-danger/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Challenge'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}