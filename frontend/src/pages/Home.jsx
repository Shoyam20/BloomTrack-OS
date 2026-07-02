import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Flower2, Sparkles, Timer, ArrowRight, BookOpen, 
  Brain, Network, Activity, Calendar, ListTodo, 
  ArrowRightLeft, Check, Terminal, ShieldAlert, Cpu,
  Bot, Link2, Sprout
} from 'lucide-react'
import Button from '../components/ui/Button'
import { useState, useEffect } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('timeline')
  const [quizSolved, setQuizSolved] = useState(null)
  
  // Floating particle setup
  const [particles, setParticles] = useState([])
  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 12 + 8,
    }))
    setParticles(generated)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  const badges = [
    { icon: <Bot className="h-3 w-3 text-blue-400" />, text: "Google Gemini" },
    { icon: <Brain className="h-3 w-3 text-purple-400" />, text: "Multi-Agent Architecture" },
    { icon: <Link2 className="h-3 w-3 text-cyan-400" />, text: "MCP Server" },
    { icon: <Sprout className="h-3 w-3 text-emerald-400" />, text: "Gamified Learning" }
  ]

  const features = [
    {
      icon: <Network className="h-5 w-5 text-purple-400" />,
      title: "Multi-Agent Architecture",
      desc: "Specialized AI agents collaborate to plan, teach, organize, and motivate students.",
      bg: "hover:border-purple-500/30 hover:shadow-purple-500/5"
    },
    {
      icon: <Brain className="h-5 w-5 text-blue-400" />,
      title: "Adaptive Learning Hub",
      desc: "Personalized roadmaps, quizzes, flashcards, and curated learning resources.",
      bg: "hover:border-blue-500/30 hover:shadow-blue-500/5"
    },
    {
      icon: <Calendar className="h-5 w-5 text-indigo-400" />,
      title: "Smart Planning",
      desc: "Automatically generates study plans, milestones, and schedules.",
      bg: "hover:border-indigo-500/30 hover:shadow-indigo-500/5"
    },
    {
      icon: <Flower2 className="h-5 w-5 text-emerald-400" />,
      title: "Bloom Garden",
      desc: "Visualize learning progress through growing flowers, XP, achievements, and streaks.",
      bg: "hover:border-emerald-500/30 hover:shadow-emerald-500/5"
    },
    {
      icon: <ArrowRightLeft className="h-5 w-5 text-cyan-400" />,
      title: "MCP Integration",
      desc: "Agents perform real actions through MCP tools including task creation, scheduling, progress tracking, and workspace updates.",
      bg: "hover:border-cyan-500/30 hover:shadow-cyan-500/5"
    },
    {
      icon: <Timer className="h-5 w-5 text-orange-400" />,
      title: "Focus Mode",
      desc: "Pomodoro timer with productivity analytics and focus tracking.",
      bg: "hover:border-orange-500/30 hover:shadow-orange-500/5"
    }
  ]

  return (
    <div className="relative min-h-screen flex flex-col justify-start items-center overflow-hidden py-12 md:py-20">
      
      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: '100vh', x: `${p.x}vw` }}
            animate={{
              opacity: [0, 0.3, 0.3, 0],
              y: '-10vh',
              x: [`${p.x}vw`, `${p.x + (Math.random() * 8 - 4)}vw`]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear'
            }}
            className="absolute rounded-full bg-primary/20 border border-primary/10"
            style={{
              width: p.size,
              height: p.size,
              top: 0,
            }}
          />
        ))}
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-primary/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl z-10 px-4 flex flex-col items-center mb-16"
      >
        {/* Sparkle Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6 shadow-inner backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span>The student personal operating system</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary mb-6 leading-[1.1]"
        >
          Your AI-Powered <br />
          <span className="bg-gradient-to-r from-blue-400 via-primary via-accent to-purple-500 bg-clip-text text-transparent">
            Learning Operating System
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-xl text-text-muted max-w-2xl mb-8 leading-relaxed font-normal"
        >
          BloomTrack OS uses Google Gemini 2.5 Flash, a Multi-Agent Architecture, and the Model Context Protocol (MCP) to help students plan, learn, stay motivated, and track their academic journey through intelligent agent collaboration.
        </motion.p>

        {/* Technology Badges */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-2 mb-10 max-w-xl"
        >
          {badges.map((b, i) => (
            <div 
              key={i} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderColor bg-surface/40 backdrop-blur-md text-xs font-semibold text-text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
            >
              {b.icon}
              <span>{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Hero Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 z-20"
        >
          <Link to="/dashboard">
            <Button variant="primary" size="lg" className="w-52 group bg-gradient-to-r from-primary to-accent border-none text-white hover:opacity-95 shadow-lg shadow-primary/20">
              Launch Workspace
              <ArrowRight className="h-4.5 w-4.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="glass" size="lg" className="w-52 border border-borderColor/60 hover:border-accent/40 bg-surface/30">
              <BookOpen className="h-4.5 w-4.5 mr-2 text-accent" />
              How It Works
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Cards Grid Section */}
      <div className="w-full max-w-6xl px-4 z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            System Modules
          </span>
          <h2 className="text-3xl font-extrabold text-text-primary mt-2">
            Engineered For Higher Education
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-lg mx-auto">
            A comprehensive suite of modules designed to synchronize your goals, studies, timelines, and habits.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              className={`p-6 border border-borderColor rounded-xl bg-card/45 backdrop-blur-md shadow-card flex flex-col items-start gap-4 transition-all duration-300 group ${feature.bg}`}
            >
              <div className="p-3 bg-surface border border-borderColor/60 rounded-xl group-hover:bg-primary/5 transition-all">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1.5 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  )
}

