"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { login } from "@/actions/auth/login";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // MFA states
  const [showMFAInput, setShowMFAInput] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email, password);

      if (result.mfaRequired) {
        // Show MFA input UI
        setMfaFactorId(result.factorId);
        setMfaChallengeId(result.challengeId);
        setShowMFAInput(true);
      } else if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      if (!mfaCode || mfaCode.length !== 6) {
        throw new Error("Please enter a valid 6-digit code");
      }

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode,
      });

      if (error) {
        throw new Error("Invalid verification code. Please try again.");
      }

      if (data) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowMFAInput(false);
    setMfaCode("");
    setMfaFactorId("");
    setMfaChallengeId("");
    setError(null);
  };

  // Shared left-panel layout (used for both login and MFA)
  const LeftPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <span className="text-primary">CodeMaster</span>
          </h1>
          <p className="text-muted-foreground">Python Programming made fun</p>
        </div>

        {children}
      </div>
    </div>
  );

  // Right hero section (unchanged)
  const HeroSection = () => (
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
      
        <p className="text-xl text-white/90 mb-8">
          Level up your programming skills with <span className="font-bold">exercises</span> in{" "}
          <span className="font-bold">python</span>, and insightful discussions.
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
  );

  // MFA Screen (replaces login form in left panel)
  if (showMFAInput) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel>
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Two-Factor Authentication</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleMFAVerification} className="space-y-4">
              <div>
                <Label htmlFor="mfa-code" className="uppercase text-xs font-semibold">
                  Verification Code
                </Label>
                <Input
                  id="mfa-code"
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest mt-1.5"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mfaCode.length === 6) {
                      handleMFAVerification(e);
                    }
                  }}
                />
                {error && <p className="text-destructive text-sm mt-1">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading || mfaCode.length !== 6}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Lost access to your authenticator?</p>
              <Link href="/auth/recovery" className="text-primary hover:underline">
                Use recovery code
              </Link>
            </div>
          </div>
        </LeftPanel>

        <HeroSection />
      </div>
    );
  }

  // Regular Login Screen
  return (
    <div className="min-h-screen flex">
      <LeftPanel>
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-muted-foreground">OR</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin(e);
                }
              }}
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
              placeholder="Enter your password"
              className="mt-1.5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin(e);
                }
              }}
            />
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link className="text-primary hover:underline font-medium" href="/auth/sign-up">
            Sign up
          </Link>
        </div>
      </LeftPanel>

      <HeroSection />
    </div>
  );
}