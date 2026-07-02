import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flower2, Sparkles, CheckSquare, Calendar, ShieldCheck, 
  ArrowRight, ArrowDown, ChevronRight, Brain, Network, 
  Cpu, Coins, Lock, Check, X, ShieldAlert, Zap, Globe, Layers, User
} from 'lucide-react'
import Button from '../components/ui/Button'

export default function HowItWorks() {
  const [selectedGardenStage, setSelectedGardenStage] = useState(3) // Default to Bloom stage

  const growthStages = [
    { 
      percent: '0%', 
      label: 'Seed', 
      emoji: '🌱',
      desc: 'Your learning goal is planted in soil. An idle state representing a new objective ready to be nurtured.',
      color: 'text-amber-400 border-amber-400/20 bg-amber-500/5',
      svg: (
        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="80" r="10" fill="#5c4033" />
          <path d="M50 80 C 45 70, 45 60, 50 55 C 55 60, 55 70, 50 80 Z" fill="#22c55e" className="animate-pulse" />
          <path d="M48 65 C 40 60, 35 60, 35 60 C 35 60, 40 65, 47 67 Z" fill="#22c55e" />
        </svg>
      )
    },
    { 
      percent: '10%', 
      label: 'Sprout', 
      emoji: '🌿',
      desc: 'First green leaves emerge. A small green shoot appears as you finish the first step of your study plan.',
      color: 'text-green-400 border-green-400/20 bg-green-500/5',
      svg: (
        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
          <path d="M50 90 L 50 60" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 70 C 40 60, 30 65, 30 65 C 30 65, 40 75, 50 72" fill="#22c55e" />
          <path d="M50 65 C 60 55, 70 60, 70 60 C 70 60, 60 70, 50 67" fill="#22c55e" />
        </svg>
      )
    },
    { 
      percent: '25%', 
      label: 'Plant', 
      emoji: '🌼',
      desc: 'Sturdy stems and branches emerge. Your daily targets accumulate and the concept is taking firm root.',
      color: 'text-teal-400 border-teal-400/20 bg-teal-500/5',
      svg: (
        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
          <path d="M50 90 C 48 70, 52 50, 50 40" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 60 C 35 50, 25 55, 25 55 C 25 55, 38 70, 50 65" fill="#22c55e" />
          <path d="M50 50 C 65 40, 75 45, 75 45 C 75 45, 62 60, 50 55" fill="#22c55e" />
          <circle cx="50" cy="40" r="8" fill="#eab308" />
        </svg>
      )
    },
    { 
      percent: '50%', 
      label: 'Bloom', 
      emoji: '🌸',
      desc: 'Petals unfold in full color! Half of your linked tasks are done. A celebration of your structured learning efforts.',
      color: 'text-pink-400 border-pink-400/20 bg-pink-500/5',
      svg: (
        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
          <path d="M50 90 C 48 70, 52 45, 50 35" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="35" r="10" fill="#ec4899" />
          {/* Petals */}
          <circle cx="50" cy="22" r="8" fill="#f472b6" />
          <circle cx="50" cy="48" r="8" fill="#f472b6" />
          <circle cx="37" cy="35" r="8" fill="#f472b6" />
          <circle cx="63" cy="35" r="8" fill="#f472b6" />
          <circle cx="50" cy="35" r="6" fill="#eab308" />
        </svg>
      )
    },
    { 
      percent: '100%', 
      label: 'Golden Bloom', 
      emoji: '🌻',
      desc: 'Goal fully achieved! A grand burst celebration. The flower has reached its maximum maturity.',
      color: 'text-yellow-400 border-yellow-400/20 bg-yellow-500/5',
      svg: (
        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
          <path d="M50 90 C 48 65, 52 40, 50 30" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="30" r="14" fill="#eab308" />
          {/* Golden Rays */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const x = 50 + Math.cos(angle) * 18;
            const y = 30 + Math.sin(angle) * 18;
            return <circle key={i} cx={x} cy={y} r="6" fill="#facc15" />;
          })}
          <circle cx="50" cy="30" r="9" fill="#78350f" />
        </svg>
      )
    },
    { 
      percent: 'Wilt', 
      label: 'Wilt', 
      emoji: '🍂',
      desc: 'Deadlines are missed or streaked breaks occur. Petals dry up and droop. Complete pending items to restore it!',
      color: 'text-red-400 border-red-400/20 bg-red-500/5',
      svg: (
        <svg className="w-24 h-24 wilt" viewBox="0 0 100 100" fill="none">
          <path d="M50 90 C 48 75, 40 60, 35 50" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          <path d="M35 50 C 25 40, 20 45, 20 45 C 20 45, 28 55, 35 52" fill="#a16207" />
          <circle cx="35" cy="50" r="6" fill="#7c2d12" />
        </svg>
      )
    }
  ]


  const agentWorkflow = [
    { 
      id: "student", 
      title: "Student", 
      color: "border-borderColor text-text-primary bg-[#0f1118]",
      icon: <User className="w-5 h-5 text-text-muted" />,
      desc: "Issues study goals or asks questions."
    },
    { 
      id: "coordinator", 
      title: "Coordinator Agent", 
      color: "border-purple-500/40 text-purple-400 bg-purple-500/5",
      icon: <Network className="w-5 h-5" />,
      desc: "Analyzes inputs and delegates sub-tasks."
    },
    { 
      id: "planner", 
      title: "Planner Agent", 
      color: "border-blue-500/40 text-blue-400 bg-blue-500/5",
      icon: <Calendar className="w-5 h-5" />,
      desc: "Generates timeline study roadmaps."
    },
    { 
      id: "tutor", 
      title: "Tutor Agent", 
      color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/5",
      icon: <Brain className="w-5 h-5" />,
      desc: "Prepares quizzes and flashcard review guides."
    },
    { 
      id: "resource", 
      title: "Resource Agent", 
      color: "border-green-500/40 text-green-400 bg-green-500/5",
      icon: <Globe className="w-5 h-5" />,
      desc: "Attaches books, articles and documents."
    },
    { 
      id: "motivation", 
      title: "Motivation Agent", 
      color: "border-orange-500/40 text-orange-400 bg-orange-500/5",
      icon: <Coins className="w-5 h-5" />,
      desc: "Awards study achievements, coins and XP."
    },
    { 
      id: "mcp", 
      title: "MCP Server", 
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/5",
      icon: <Cpu className="w-5 h-5" />,
      desc: "Exposes secure tool calls to databases."
    },
    { 
      id: "workspace", 
      title: "BloomTrack Workspace", 
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/5",
      icon: <Flower2 className="w-5 h-5" />,
      desc: "UI renders updated tasks, calendar and garden."
    }
  ]

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 z-10 relative">
      
      {/* SECTION 1 — HERO */}
      <section className="text-center mb-24 relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6 shadow-inner"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span>Architecture & Core Mechanics</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent leading-[1.15]"
        >
          How BloomTrack OS Works
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed mb-10"
        >
          BloomTrack OS uses Google Gemini 2.5 Flash, a Multi-Agent Architecture, and the Model Context Protocol (MCP) to help students plan, learn, stay motivated, and track their academic journey through intelligent agent collaboration.
        </motion.p>

        {/* Animated badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
          className="flex flex-wrap justify-center gap-2 max-w-2xl"
        >
          {[
            { text: "🤖 Google Gemini", delay: 0 },
            { text: "🧠 Multi-Agent Architecture", delay: 0.1 },
            { text: "🔗 MCP Server", delay: 0.2 },
            { text: "🌱 Gamified Learning", delay: 0.3 }
          ].map((b, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: b.delay, type: "spring", stiffness: 100 }}
              className="px-3.5 py-1.5 rounded-full border border-borderColor bg-surface/50 text-xs font-semibold text-text-primary hover:border-primary/45 transition-colors"
            >
              {b.text}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* SECTION 2 — WHY BLOOMTRACK */}
      <section className="mb-28 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Core Advantages</span>
          <h2 className="text-3xl font-extrabold text-text-primary mt-2">Why BloomTrack OS?</h2>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">Modern workflows engineered to support hyper-focused academic progression.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: <Network className="w-6 h-6 text-purple-400" />,
              title: "🤖 Multi-Agent Intelligence",
              desc: "Specialized agents collaborate to solve complex student workflows. When you ask a query, agents interact internally to coordinate a response.",
              glow: "hover:border-purple-500/30 hover:shadow-purple-500/5"
            },
            {
              icon: <Calendar className="w-6 h-6 text-blue-400" />,
              title: "📅 Smart Planning",
              desc: "Automatically creates study plans, tasks and calendar schedules. No more manual entry—AI maps out details according to your goal targets.",
              glow: "hover:border-blue-500/30 hover:shadow-blue-500/5"
            },
            {
              icon: <Brain className="w-6 h-6 text-indigo-400" />,
              title: "📚 Adaptive Learning",
              desc: "Provides personalized resources, quizzes and flashcards. Tailors educational material based on previous session mistakes and strengths.",
              glow: "hover:border-indigo-500/30 hover:shadow-indigo-500/5"
            },
            {
              icon: <Coins className="w-6 h-6 text-emerald-400" />,
              title: "🌸 Gamified Growth",
              desc: "Earn XP, Coins and grow your Bloom Garden while learning. The visual garden maps directly to task completions to prevent wilting.",
              glow: "hover:border-emerald-500/30 hover:shadow-emerald-500/5"
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`p-6 border border-borderColor rounded-xl bg-card/20 glass transition-all duration-300 group flex flex-col gap-4 relative overflow-hidden ${card.glow}`}
            >
              <div className="p-3 bg-surface border border-borderColor/60 rounded-xl w-fit group-hover:bg-primary/5 transition-colors">
                {card.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary mb-2">{card.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{card.desc}</p>
              </div>
              {/* Glowing decorative indicator */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[30px] rounded-full pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — BLOOM GARDEN */}
      <section className="mb-28">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Gamification Pipeline</span>
          <h2 className="text-3xl font-extrabold text-text-primary mt-2">Digital Garden Growth Stages</h2>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">Click on any stage below to inspect the growth cycle of your virtual flower garden.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/30 border border-borderColor/60 rounded-2xl p-6 glass max-w-5xl mx-auto">
          {/* Left Column: Timeline list - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {growthStages.map((stage, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedGardenStage(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                  selectedGardenStage === idx 
                    ? 'bg-primary/10 border-primary/50 text-text-primary shadow-inner' 
                    : 'bg-surface/30 border-borderColor/40 hover:border-borderColor hover:bg-surface/50 text-text-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{stage.emoji}</span>
                  <span className="text-xs font-bold">{stage.label}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-borderColor">
                  {stage.percent}
                </span>
              </button>
            ))}
          </div>

          {/* Right Column: Illustration Viewport - 7 cols */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 border border-borderColor/50 bg-background/60 rounded-xl min-h-[300px] text-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGardenStage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center z-10"
              >
                {/* SVG Illustration Container */}
                <div className={`p-4 rounded-full border mb-4 flex items-center justify-center ${growthStages[selectedGardenStage].color}`}>
                  {growthStages[selectedGardenStage].svg}
                </div>
                
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  Stage: {growthStages[selectedGardenStage].label} ({growthStages[selectedGardenStage].percent})
                </h3>
                <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                  {growthStages[selectedGardenStage].desc}
                </p>
              </motion.div>
            </AnimatePresence>
            
            {/* Background glowing sphere */}
            <div className="absolute w-44 h-44 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* SECTION 4 — MULTI AGENT WORKFLOW */}
      <section className="mb-28">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Orchestrator Architecture</span>
          <h2 className="text-3xl font-extrabold text-text-primary mt-2">Multi-Agent Workflow Flowchart</h2>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">Visualizing the path of user prompts through coordinating clusters down to tool actions.</p>
        </div>

        {/* Dynamic Diagram */}
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative">
          
          {/* Row 1: Student */}
          <div className="w-full flex justify-center">
            <div className="p-4 rounded-xl border border-borderColor bg-card glass w-60 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-text-primary font-bold text-sm mb-1">
                <User className="w-4 h-4 text-text-muted" />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-text-muted">Asks study goals or tasks</p>
            </div>
          </div>

          <div className="flex justify-center text-purple-500 animate-pulse">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Row 2: Coordinator */}
          <div className="w-full flex justify-center">
            <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-500/5 w-60 text-center shadow-lg shadow-purple-500/5">
              <div className="flex items-center justify-center gap-2 text-purple-400 font-bold text-sm mb-1">
                <Network className="w-4 h-4" />
                <span>Coordinator Agent</span>
              </div>
              <p className="text-[10px] text-text-muted">Analyzes prompt, maps plan, and coordinates sub-agents</p>
            </div>
          </div>

          <div className="flex justify-center text-blue-500 animate-pulse">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Row 3: Sub Agents Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[
              { title: "Planner Agent", desc: "Builds calendar roadmaps", color: "border-blue-500/40 text-blue-400 bg-blue-500/5", icon: <Calendar className="w-4 h-4" /> },
              { title: "Tutor Agent", desc: "Generates quiz guides", color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/5", icon: <Brain className="w-4 h-4" /> },
              { title: "Resource Agent", desc: "Crawls syllabus files", color: "border-green-500/40 text-green-400 bg-green-500/5", icon: <Globe className="w-4 h-4" /> },
              { title: "Motivation Agent", desc: "Rewards XP and Coins", color: "border-orange-500/40 text-orange-400 bg-orange-500/5", icon: <Coins className="w-4 h-4" /> }
            ].map((sub, idx) => (
              <div key={idx} className={`p-4 rounded-xl border text-center shadow-md ${sub.color}`}>
                <div className="flex items-center justify-center gap-2 font-bold text-xs mb-1">
                  {sub.icon}
                  <span>{sub.title}</span>
                </div>
                <p className="text-[10px] text-text-muted">{sub.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center text-cyan-500 animate-pulse">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Row 4: MCP Server */}
          <div className="w-full flex justify-center">
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-500/5 w-60 text-center shadow-lg shadow-cyan-500/5">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                <Cpu className="w-4 h-4" />
                <span>MCP Server</span>
              </div>
              <p className="text-[10px] text-text-muted">Exposes secure SQLite/Supabase tool endpoints</p>
            </div>
          </div>

          <div className="flex justify-center text-emerald-500 animate-pulse">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Row 5: Workspace */}
          <div className="w-full flex justify-center">
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 w-60 text-center shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Flower2 className="w-4 h-4" />
                <span>BloomTrack Workspace</span>
              </div>
              <p className="text-[10px] text-text-muted">Visual state is updated automatically</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="text-center bg-card/40 glass border border-borderColor/60 p-8 sm:p-14 rounded-2xl flex flex-col items-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 blur-[50px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-accent/5 blur-[50px] pointer-events-none rounded-full" />

        <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          Ready to Build Your Future?
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mb-8 max-w-md leading-relaxed">
          BloomTrack OS helps students learn smarter through AI-powered planning, personalized education, gamification, and intelligent automation.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/dashboard">
            <Button variant="primary" className="group w-48 bg-gradient-to-r from-primary to-accent border-none text-white shadow-lg">
              Launch Workspace
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}

