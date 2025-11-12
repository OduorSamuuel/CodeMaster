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
  Search,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChallengeData } from '@/types';


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
  initialDifficulty,
}: ChallengesListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [difficultyFilter, setDifficultyFilter] = useState(initialDifficulty);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helpers
  const categories = Array.from(new Set(challenges.map(c => c.category)));

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
    startTransition(() => router.push(`/admin/challenges?${params.toString()}`));
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
    startTransition(() => router.push('/admin/challenges'));
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
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
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}

            {isPending && <span className="text-sm text-muted-foreground">Updating...</span>}
          </div>
        </div>

        {/* Challenges List */}
        {challenges.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-lg font-semibold mb-2">No challenges found</p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first challenge'}
            </p>
          </div>
        ) : (
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
                        <Button variant="ghost" size="icon">
                          {challenge.is_locked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          <span className="sr-only">
                            {challenge.is_locked ? 'Unlock' : 'Lock'}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{challenge.is_locked ? 'Unlock' : 'Lock'}</TooltipContent>
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
              Showing {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, total)} of {total} challenges
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="sr-only">Previous</span>
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
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
                {isDeleting ? 'Deleting...' : 'Delete Challenge'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}