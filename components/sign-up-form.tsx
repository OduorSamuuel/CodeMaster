

"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/actions/auth/register";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

 const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // ✅ Client-side password match validation
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(email, password);
      if (result.success) {
        router.push("/auth/sign-up-success");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="text-primary">CodeMaster</span>
            </h1>
            <p className="text-muted-foreground">
              Python Programming made fun
            </p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">OR</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="email" className="uppercase text-xs font-semibold">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="uppercase text-xs font-semibold">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min 6 chars)"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="repeat-password" className="uppercase text-xs font-semibold">
                Repeat Password
              </Label>
              <Input
                id="repeat-password"
                name="repeat-password"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repeat your password"
                className="mt-1.5"
                required
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link className='text-primary hover:underline font-medium' href="/account/auth/login">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex lg:w-3/5 bg-primary items-center justify-center p-16 relative overflow-hidden">
        {/* Floating avatars */}
        <div className="absolute top-16 left-20 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-secondary"></div>
        </div>
        <div className="absolute top-24 right-32 w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-warning"></div>
        </div>
        <div className="absolute top-48 right-16 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-info"></div>
        </div>
        <div className="absolute bottom-32 left-16 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-success"></div>
        </div>
        <div className="absolute bottom-48 left-1/3 w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-secondary"></div>
        </div>
        <div className="absolute bottom-24 right-24 w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-warning"></div>
        </div>

        <div className="text-center z-10 max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            CodeMaster is free for all people, everywhere
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Level up your programming skills with <span className="font-bold">exercises</span> in <span className="font-bold">python</span>, and insightful discussions.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl">💎</span>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔷</span>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔶</span>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-colors">
              +10 more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}