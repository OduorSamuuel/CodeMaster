import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import {
  Trophy, Zap, Target, Gamepad2, TrendingUp, Award, BarChart3,
  ArrowRight, CheckCircle2, Code2, Users, Star, Brain, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  
  // If user is logged in, fetch their profile
  let userRole = null;
  if (user?.sub) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.sub)
      .single();
    
    userRole = profile?.role;
  }
  
  // Determine dashboard link based on role
  const dashboardLink = userRole === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <main className="min-h-screen">

      {/* Navigation */}
      <nav className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CodeMaster</span>
          </div>
          <div className="flex items-center gap-8">
            {!user && (
              <>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                  How It Works
                </Link>
              </>
            )}
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background via-secondary/5 to-background overflow-hidden pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
            <Gamepad2 className="w-4 h-4" />
            Gamified Python Learning Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Master Python Through
            <span className="text-primary"> Gamified Learning</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Earn XP, climb leaderboards, and track your progress. Turn Python mastery into an exciting journey.
          </p>

          <div className="flex justify-center gap-4 mb-20">
            {user ? (
              <>
                <Button asChild className="px-8 py-3.5 text-base shadow-lg shadow-primary/25">
                  <Link href={dashboardLink} className="flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-3.5 text-base">
                  <Link href="/challenges" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Browse Challenges
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild className="px-8 py-3.5 text-base shadow-lg shadow-primary/25">
                <Link href="/auth/sign-up" className="flex items-center gap-2">
                  Start Learning Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-2xl">
              <div className="bg-muted/50 rounded-xl p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-xs text-muted-foreground">solution.py</span>
                </div>
                <div className="space-y-2 text-left">
                  <div><span className="text-purple-500">def</span> <span className="text-blue-500">solve_challenge</span>(<span className="text-orange-400">difficulty</span>):</div>
                  <div className="pl-4"><span className="text-foreground/80">points</span> = <span className="text-green-500">difficulty</span> * <span className="text-amber-500">100</span></div>
                  <div className="pl-4"><span className="text-purple-500">return</span> <span className="text-blue-400">f &quot;Earned </span><span className="text-green-500">{`{points}`}</span><span className="text-blue-400"> XP!&quot;</span></div>
                  <div className="mt-4 text-muted-foreground"># Output: Earned 300 XP!</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">Level 12</span>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                +500 XP
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold">Rank #247</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete learning ecosystem designed to transform you from beginner to Python expert.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Adaptive Learning */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Adaptive Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered system that adapts to your skill level and creates personalized challenges that match your pace.
              </p>
            </div>

            {/* XP & Leaderboards */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">XP & Leaderboards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn experience points for every challenge solved. Compete with learners worldwide and climb the ranks.
              </p>
            </div>

            {/* Real-Time Coding */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Real-Time Coding</h3>
              <p className="text-muted-foreground leading-relaxed">
                Write and execute Python code instantly with immediate feedback, hints, and detailed explanations.
              </p>
            </div>

            {/* Progress Tracking */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Progress Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize your journey with detailed analytics, skill breakdowns, and achievement milestones.
              </p>
            </div>

            {/* Badges & Rewards */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Badges & Rewards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unlock exclusive badges, collect achievements, and showcase your Python mastery to the community.
              </p>
            </div>

            {/* Community Challenges */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Community Challenges</h3>
              <p className="text-muted-foreground leading-relaxed">
                Join coding competitions, collaborate with peers, and learn from top performers in the community.
              </p>
            </div>

            {/* AI-Powered Recommendations */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">AI-Powered Recommendations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes your performance and recommends the best next challenge to keep you in the optimal learning zone.
              </p>
            </div>

            {/* Deep-Dive AI Explanations */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Deep-Dive AI Explanations</h3>
              <p className="text-muted-foreground leading-relaxed">
                After completing a challenge, get AI-generated insights, alternative solutions, and real-world applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Your Path to Python Mastery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your coding skills through gamified learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-2xl font-bold mb-6 shadow-lg shadow-primary/25">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Choose Your Path</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Take our skill assessment to find your perfect starting point. Whether you&lsquo;re a complete beginner or advancing your skills, we&lsquo;ll create a personalized learning path just for you.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Beginner</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Intermediate</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Advanced</span>
                </div>
              </div>
              <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-border"></div>
            </div>

            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-2xl font-bold mb-6 shadow-lg shadow-primary/25">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Solve & Compete</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Tackle coding challenges, earn XP for every solution, and watch your rank climb. See where you stand against other learners and unlock new difficulty levels.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Average: 350 XP/day</span>
                </div>
              </div>
              <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-border"></div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-2xl font-bold mb-6 shadow-lg shadow-primary/25">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Monitor your growth with detailed analytics, celebrate milestones, and earn badges. Watch your skills evolve from beginner to Python expert through data-driven insights.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Track 50+ metrics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium mb-4">
                GAMIFICATION
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
                Learning That Feels Like
                <span className="text-primary"> Playing</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our gamified platform transforms complex Python concepts into exciting challenges. Earn rewards, compete with friends, and stay motivated every step of the way.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Real-time XP System</div>
                    <div className="text-sm text-muted-foreground">Earn experience points instantly as you solve challenges and level up your skills.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Global Leaderboards</div>
                    <div className="text-sm text-muted-foreground">Compete with learners worldwide and see how you rank in real-time.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Achievement Unlocks</div>
                    <div className="text-sm text-muted-foreground">Collect badges and showcase your Python expertise to the community.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Skill Progress Tracking</div>
                    <div className="text-sm text-muted-foreground">Visualize your improvement across different Python topics and concepts.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Your Rank</div>
                    <div className="text-3xl font-bold text-foreground">#247</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Total XP</div>
                    <div className="text-3xl font-bold text-primary">12,450</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                      <div>
                        <div className="font-semibold text-sm">Sarah Chen</div>
                        <div className="text-xs text-muted-foreground">Level 45</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">24,890 XP</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                      <div>
                        <div className="font-semibold text-sm">Mike Johnson</div>
                        <div className="text-xs text-muted-foreground">Level 42</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">21,340 XP</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      <div>
                        <div className="font-semibold text-sm">Emma Wilson</div>
                        <div className="text-xs text-muted-foreground">Level 40</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">19,750 XP</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">247</div>
                      <div>
                        <div className="font-semibold text-sm">You</div>
                        <div className="text-xs text-muted-foreground">Level 23</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">12,450 XP</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Next Level</span>
                    <span className="font-semibold text-foreground">Level 24</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">650 XP until next level</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-amber-500 text-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 rotate-3">
                <Star className="w-4 h-4 fill-white" />
                <span className="font-bold text-sm">Top 5%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary via-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground leading-tight">
            {user ? 'Continue Your Python Journey' : 'Ready to Start Your Python Journey?'}
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            {user 
              ? 'Keep building your skills and climb the leaderboard. Your next challenge awaits!'
              : 'Join thousands of learners mastering Python through our gamified platform. Start free today and level up your skills.'
            }
          </p>
          <div className="flex justify-center">
            {user ? (
              <Button asChild size="lg" variant="secondary" className="text-base shadow-xl">
                <Link href="/challenges" className="flex items-center gap-2">
                  View Challenges
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="secondary" className="text-base shadow-xl">
                <Link href="/auth/sign-up" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">CodeMaster</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                The gamified platform that makes learning Python addictive and effective. Join thousands of learners leveling up their coding skills.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Challenges</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 CodeMaster. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}