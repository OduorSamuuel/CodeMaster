import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="w-full border-b border-border backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
            <span className="text-3xl font-bold text-primary">CodeMaster</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How It Works
            </Link>
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative  bg-gradient-to-br from-secondary via-background to-muted overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-3 rounded-full text-sm font-semibold mb-8 shadow-md animate-pulse">
            🎮 Gamified Python Learning
          </div>
          
          <h1 className="text-5xl md:text-8xl font-extrabold mb-8 text-foreground leading-tight">
            Master Python<br />
            <span className="text-primary">Through Play</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your Python journey with gamified challenges, personalized learning paths, and interactive quizzes that make coding irresistibly fun.
          </p>
          
          <div className="flex justify-center mb-20">
            <button className="bg-primary text-primary-foreground px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg">
              Start Learning Python
            </button>
          </div>

        
        </div>

        {/* Floating Elements */}
        <div className="absolute top-32 left-8 opacity-30 animate-bounce delay-100">
          <div className="bg-primary text-primary-foreground p-4 rounded-xl font-mono text-sm shadow-lg">
            print("Hello Python!")
          </div>
        </div>
        <div className="absolute top-48 right-8 opacity-30 animate-pulse delay-300">
          <div className="bg-muted text-muted-foreground p-4 rounded-xl font-mono text-sm shadow-lg">
            def learn(): return "fun"
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Game-Changing Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience Python learning like never before with features designed to keep you engaged and accelerate your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-card border border-border rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">Adaptive Learning</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                AI-powered system that adapts to your Python skill level, learning speed, and preferred topics to create the perfect challenge every time.
              </p>
            </div>

            <div className="group bg-card border border-border rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">Achievement System</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Earn XP points, unlock badges, and climb leaderboards. Turn Python mastery into an addictive game with meaningful rewards.
              </p>
            </div>

            <div className="group bg-card border border-border rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">Interactive Coding</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Write, test, and debug Python code in real-time with instant feedback, hints, and detailed explanations for every concept.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Your Python Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Follow your personalized path from Python basics to advanced mastery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 items-start">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Choose Your Level</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Start with Python basics or jump into advanced topics. Our assessment finds your perfect starting point and creates a custom learning path.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="absolute -inset-2 bg-accent/20 rounded-full animate-ping delay-150"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Code & Conquer</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Solve Python challenges, build projects, and compete with fellow learners. Every line of code earns you XP and unlocks new adventures.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping delay-300"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Become a Master</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Track your Python mastery, celebrate milestones, and showcase your skills. Graduate from beginner to Python expert through play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Experience */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                Python Learning<br />
                <span className="text-accent">Made Addictive</span>
              </h2>
              <p className="text-xl opacity-90 mb-10 leading-relaxed">
                Experience the most engaging way to master Python programming. Our platform transforms complex concepts into exciting challenges that keep you coming back for more.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-accent-foreground font-bold text-lg">✓</span>
                  </div>
                  <span className="text-lg font-medium">Real-time Python code execution</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-accent-foreground font-bold text-lg">✓</span>
                  </div>
                  <span className="text-lg font-medium">Progressive difficulty system</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-accent-foreground font-bold text-lg">✓</span>
                  </div>
                  <span className="text-lg font-medium">Comprehensive Python library coverage</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-accent-foreground font-bold text-lg">✓</span>
                  </div>
                  <span className="text-lg font-medium">Community challenges and competitions</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-background/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/20">
                <div className="bg-muted rounded-2xl p-6 font-mono text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-primary">def</span> <span className="text-accent-foreground">calculate_score</span>():
                    </div>
                    <div className="pl-4"><span className="text-accent-foreground">points</span> = <span className="text-accent">100</span></div>
                    <div className="pl-4"><span className="text-primary">return</span> <span className="text-accent-foreground">points</span> * <span className="text-accent">level</span></div>
                    <div></div>
                    <div><span className="text-muted-foreground"># You earned 500 XP! 🎉</span></div>
                  </div>
                </div>
              </div>
              
              {/* Floating achievement badge */}
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                +500 XP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Level Up Your Skills
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover features designed to accelerate your Python mastery through engaging, interactive experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Structured Curriculum</h3>
              <p className="text-muted-foreground">From variables to machine learning, follow a carefully crafted Python learning path.</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Quest System</h3>
              <p className="text-muted-foreground">Complete coding quests, earn rewards, and unlock new Python adventures.</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Smart Hints</h3>
              <p className="text-muted-foreground">Get contextual help and explanations exactly when you need them most.</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🏅</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Achievement Badges</h3>
              <p className="text-muted-foreground">Collect badges for mastering Python concepts, completing projects, and helping others.</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Progress Tracking</h3>
              <p className="text-muted-foreground">Visualize your Python journey with detailed analytics and milestone celebrations.</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Real Projects</h3>
              <p className="text-muted-foreground">Build actual Python applications while learning - from web scrapers to data analysis tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-primary-foreground leading-tight">
            Ready to Become a<br />
            <span className="text-accent">Python Master?</span>
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-12 leading-relaxed">
            Join thousands of learners who've transformed their coding skills through our gamified Python platform.
          </p>
          <button className="bg-accent text-accent-foreground px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg">
            Begin Your Adventure
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-primary">CodeMaster</span>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <div className="text-muted-foreground">
              © 2025 CodeMaster. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}