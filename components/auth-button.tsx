import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, LayoutDashboard, Trophy } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  // Get user session
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // If user is logged in, fetch their profile to get role
  let userRole = null;
  let userName = null;
  if (user?.sub) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, full_name")
      .eq("id", user.sub)
      .single();
    
    userRole = profile?.role;
    userName = profile?.full_name;
  }

  // Determine dashboard link based on role
  const dashboardLink = userRole === "admin" ? "/admin/dashboard" : "/dashboard";

  return user ? (
    <div className="flex items-center gap-4">
      {/* Navigation Links */}
      <Link 
        href={dashboardLink}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </Link>
      
      <Link 
        href="/challenges"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
      >
        <Trophy className="w-4 h-4" />
        Challenges
      </Link>

      {/* User Account Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="max-w-[100px] truncate">
              {userName || user.email?.split('@')[0] || 'Account'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userName || 'My Account'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}