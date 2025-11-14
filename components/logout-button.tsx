"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div 
      onClick={handleLogout}
      className="flex items-center w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </div>
  );
}