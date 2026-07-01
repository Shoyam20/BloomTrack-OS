import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flower2, Sparkles, Timer, ArrowRight, BookOpen } from 'lucide-react'
import Button from '../components/ui/Button'

export default function Home() {
  // Generate random particles for floating background
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100, // percentage
    y: Math.random() * 100, // percentage
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
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

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden py-10">
      
      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: '110vh', x: `${p.x}vw` }}
            animate={{
              opacity: [0, 0.4, 0.4, 0],
              y: '-10vh',
              x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear'
            }}
            className="absolute rounded-full bg-accent/20 border border-accent/10"
            style={{
              width: p.size,
              height: p.size,
              top: 0,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-3xl z-10 px-4 flex flex-col items-center"
      >
        {/* Sparkle Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6 shadow-inner"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>The student personal operating system</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary mb-6 leading-[1.1]"
        >
          Your AI-powered <br />
          <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
            Personal Operating System
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-xl text-text-muted max-w-xl mb-10 leading-relaxed font-normal"
        >
          Goals become flowers. Tasks build habits. BloomTrack AI OS keeps you on track.
        </motion.p>

        {/* Hero Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link to="/dashboard">
            <Button variant="primary" size="lg" className="w-48 group">
              Launch Workspace
              <ArrowRight className="h-4.5 w-4.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="outline" size="lg" className="w-48">
              <BookOpen className="h-4.5 w-4.5 mr-2" />
              How It Works
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4 z-10"
      >
        {/* Card 1: Garden */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="p-6 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex flex-col items-start gap-4 transition-all duration-200"
        >
          <div className="p-3 bg-success/15 rounded-lg border border-success/20 text-success">
            <Flower2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Digital Flower Garden
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Plant goals and see them grow as virtual flowers. Complete daily targets to prevent them from wilting.
            </p>
          </div>
        </motion.div>

        {/* Card 2: AI Chief */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="p-6 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex flex-col items-start gap-4 transition-all duration-200"
        >
          <div className="p-3 bg-primary/15 rounded-lg border border-primary/20 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              BloomTrack AI OS
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Your automated personal assistant. Formulate study schedules, log plans, and approve proposed calendar schedules.
            </p>
          </div>
        </motion.div>

        {/* Card 3: Focus */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="p-6 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex flex-col items-start gap-4 transition-all duration-200"
        >
          <div className="p-3 bg-accent/15 rounded-lg border border-accent/20 text-accent">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Smart Focus System
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Timed Pomodoro sessions synced with task lists. Track your weekly concentration analytics and time blocks.
            </p>
          </div>
        </motion.div>
      </motion.div>

    </div>
  )
}
