import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Target, CheckCircle2, Timer, Flame, Plus, Info, Flower2, Sparkles, BookOpen, Award, RefreshCw, Brain } from 'lucide-react'
import FlowerGarden from '../components/flowers/FlowerGarden'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../hooks/useToast'
import {
  format,
  subDays,
  startOfToday,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth
} from 'date-fns'

export default function Dashboard() {
  const {
    goals,
    tasks,
    focusSessions,
    addGoal,
    generateSubGoals,
    geminiApiKey,
    profile
  } = useStore()

  const { toast } = useToast()
  
  const [addGoalOpen, setAddGoalOpen] = useState(false)
  const [hoveredCell, setHoveredCell] = useState(null)

  // Form states for Add Goal
  const [goalTitle, setGoalTitle] = useState('')
  const [goalCategory, setGoalCategory] = useState('Learning')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [goalFlowerType, setGoalFlowerType] = useState('Lavender')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalMilestones, setGoalMilestones] = useState([''])
  const [formError, setFormError] = useState('')
  
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [timePeriod, setTimePeriod] = useState('1 month')
  const [customDeadline, setCustomDeadline] = useState(format(new Date(), 'yyyy-MM-dd'))

  const calculateDeadlineDate = (period, customDate = '') => {
    const today = new Date();
    if (period === '1 week') {
      today.setDate(today.getDate() + 7);
    } else if (period === '2 weeks') {
      today.setDate(today.getDate() + 14);
    } else if (period === '1 month') {
      today.setMonth(today.getMonth() + 1);
    } else if (period === '3 months') {
      today.setMonth(today.getMonth() + 3);
    } else if (period === '6 months') {
      today.setMonth(today.getMonth() + 6);
    } else if (period === '1 year') {
      today.setFullYear(today.getFullYear() + 1);
    } else if (period === 'Custom date') {
      return customDate || format(new Date(), 'yyyy-MM-dd');
    }
    return today.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (timePeriod === 'Custom date') {
      setGoalDeadline(customDeadline)
    } else {
      setGoalDeadline(calculateDeadlineDate(timePeriod))
    }
  }, [timePeriod, customDeadline])

  // Listener to open add goal modal from Garden EmptyState CTA
  useEffect(() => {
    const handleOpenModal = () => setAddGoalOpen(true)
    window.addEventListener('open-add-goal-modal', handleOpenModal)
    return () => window.removeEventListener('open-add-goal-modal', handleOpenModal)
  }, [])

  // ----------------------------------------------------
  // AI Coach Recommendations Fetching
  // ----------------------------------------------------
  const [recommendations, setRecommendations] = useState(null)
  const [loadingRecs, setLoadingRecs] = useState(false)

  const fetchRecommendations = async () => {
    setLoadingRecs(true)
    try {
      const state = useStore.getState()
      const workspaceState = {
        tasks: state.tasks,
        goals: state.goals,
        plans: state.plans,
        calendarEvents: state.calendarEvents,
        garden: state.garden,
        customResources: state.customResources,
        notifications: state.notifications,
        learningHub: state.learningHub
      }

      const res = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': geminiApiKey || ''
        },
        body: JSON.stringify({ workspaceState, profile, customApiUrl: state.customApiUrl })
      })

      if (res.ok) {
        const data = await res.json()
        setRecommendations(data)
      } else {
        console.warn('Failed to load AI recommendations.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRecs(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Calculate Quick Stats
  const activeGoalsCount = goals.filter((g) => g.progress < 100).length
  
  const tasksTodayCount = tasks.filter(
    (t) => t.deadline === todayStr && t.status !== 'Done'
  ).length

  // Calculate Focus Hours This Week
  const oneWeekAgo = subDays(new Date(), 7)
  const weeklyFocusMinutes = focusSessions
    .filter((fs) => new Date(fs.completedAt) >= oneWeekAgo)
    .reduce((sum, fs) => sum + fs.duration, 0)
  const weeklyFocusHours = (weeklyFocusMinutes / 60).toFixed(1)

  // Calculate Day Streak (Focus sessions and completed tasks)
  const getStreak = () => {
    const dates = new Set()
    focusSessions.forEach((fs) => dates.add(fs.completedAt.split('T')[0]))
    tasks.forEach((t) => {
      if (t.status === 'Done' && t.deadline) {
        dates.add(t.deadline)
      }
    })

    let streak = 0
    let checkDate = startOfToday()

    // If no activity today, check if there was yesterday
    const todayFormatted = format(checkDate, 'yyyy-MM-dd')
    const yesterdayFormatted = format(subDays(checkDate, 1), 'yyyy-MM-dd')

    if (!dates.has(todayFormatted) && !dates.has(yesterdayFormatted)) {
      return 0
    }

    // Start checking backwards from the last active date (today or yesterday)
    let startDate = dates.has(todayFormatted) ? checkDate : subDays(checkDate, 1)

    while (true) {
      const dateStr = format(startDate, 'yyyy-MM-dd')
      if (dates.has(dateStr)) {
        streak++
        startDate = subDays(startDate, 1)
      } else {
        break
      }
    }
    return streak
  }

  const dayStreak = getStreak()

  const [matrixDate, setMatrixDate] = useState(new Date())

  const handlePrevMonth = () => {
    setMatrixDate((d) => subMonths(d, 1))
  }
  const handleNextMonth = () => {
    setMatrixDate((d) => addMonths(d, 1))
  }

  // Generate Month Heatmap Data
  const generateMonthMatrixData = () => {
    const startMonth = startOfMonth(matrixDate)
    const endMonth = endOfMonth(matrixDate)
    const startGrid = startOfWeek(startMonth, { weekStartsOn: 0 }) // Sunday start
    const endGrid = endOfWeek(endMonth, { weekStartsOn: 0 }) // Saturday end

    const days = eachDayOfInterval({ start: startGrid, end: endGrid })

    const gridData = days.map((currentDate) => {
      const dateString = format(currentDate, 'yyyy-MM-dd')
      const isCurrentMonthDay = isSameMonth(currentDate, matrixDate)

      // Calculate daily score
      const completedTasks = tasks.filter(
        (t) => t.status === 'Done' && t.deadline === dateString
      ).length

      const focusMinutes = focusSessions
        .filter((fs) => fs.completedAt.split('T')[0] === dateString)
        .reduce((sum, fs) => sum + fs.duration, 0)

      const focusHours = focusMinutes / 60
      const activityScore = completedTasks + focusHours

      return {
        date: dateString,
        completedTasks,
        focusHours: parseFloat(focusHours.toFixed(1)),
        score: activityScore,
        isCurrentMonthDay
      }
    })

    return gridData
  }

  const monthGridDays = generateMonthMatrixData()

  // Map activity score to color variables
  const getCellColor = (score) => {
    if (score === 0) return 'bg-white/[0.03] border-white/[0.01]' // Dark empty cell
    if (score <= 1) return 'bg-cyan-900/40 border-cyan-800/20 text-cyan-200'
    if (score <= 2) return 'bg-cyan-700/60 border-cyan-600/30 text-cyan-100'
    if (score <= 3) return 'bg-cyan-500/80 border-cyan-400/40 text-white'
    return 'bg-accent border-cyan-300 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]'
  }

  // Add Milestone input handler
  const handleAddMilestoneInput = () => {
    setGoalMilestones([...goalMilestones, ''])
  }

  const handleMilestoneInputChange = (index, value) => {
    const updated = [...goalMilestones]
    updated[index] = value
    setGoalMilestones(updated)
  }

  // Handle Goal Submission
  const handleCreateGoalSubmit = (e) => {
    e.preventDefault()
    if (!goalTitle.trim()) {
      setFormError('Goal Title is required')
      return
    }
    if (!goalDeadline) {
      setFormError('Deadline date is required')
      return
    }

    const milestonesFiltered = goalMilestones
      .filter((m) => m.trim() !== '')
      .map((m) => ({ title: m, completed: false }))

    const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newGoal = {
      id: goalId,
      title: goalTitle,
      category: goalCategory,
      deadline: goalDeadline,
      flowerType: goalFlowerType,
      progress: 0,
      milestones: milestonesFiltered,
      description: goalDesc,
      hoursPerWeek: Number(hoursPerWeek),
      createdAt: new Date().toISOString()
    }

    addGoal(newGoal)
    toast.success('Goal planted! Flower added to garden 🌸')
    
    // Reset Form
    setGoalTitle('')
    setGoalCategory('Learning')
    setGoalFlowerType('Lavender')
    setGoalDesc('')
    setGoalMilestones([''])
    setHoursPerWeek(10)
    setTimePeriod('1 month')
    setCustomDeadline(format(new Date(), 'yyyy-MM-dd'))
    setFormError('')
    setAddGoalOpen(false)

    // Trigger sub-goal generation
    generateSubGoals(goalId)
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome & Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Workspace Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Grow your targets, log study sessions, and review your productivity metrics.
          </p>
        </div>
        <Button onClick={() => setAddGoalOpen(true)} className="flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
          <Plus className="h-4 w-4" /> Plant New Goal
        </Button>
      </div>

      {/* 🤖 AI Coach Recommendations Widget */}
      <div className="border border-borderColor rounded-xl bg-card/25 p-5 glass shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-borderColor/30 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-accent/20 text-accent animate-pulse">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  AI Coach Adaptive Recommendations
                  <span className="text-[9px] bg-accent/20 text-accent border border-accent/20 px-1 py-0.2 rounded font-semibold tracking-wider uppercase">
                    Adaptive
                  </span>
                </h2>
                <p className="text-[10px] text-text-muted">
                  Personalized suggestions based on your streak, quiz revisions, and focus logs.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={fetchRecommendations}
              disabled={loadingRecs}
              className="flex items-center gap-1 text-[10px] py-1 px-2.5"
            >
              <RefreshCw className={`h-3 w-3 ${loadingRecs ? 'animate-spin' : ''}`} />
              Sync Advice
            </Button>
          </div>

          {loadingRecs ? (
            <div className="flex items-center justify-center py-6 text-xs text-text-muted gap-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Analyzing workspace performance...</span>
            </div>
          ) : recommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: Focus Today */}
              <div className="p-3.5 border border-borderColor/50 rounded-lg bg-surface/30 flex items-start gap-2.5">
                <div className="p-2 rounded bg-primary/10 text-primary mt-0.5">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-text-primary text-[11px] block">Focus of the Day</span>
                  <p className="text-text-muted text-[11px] leading-relaxed">{recommendations.focusToday}</p>
                </div>
              </div>

              {/* Card 2: Revision Alert */}
              <div className="p-3.5 border border-borderColor/50 rounded-lg bg-surface/30 flex items-start gap-2.5">
                <div className="p-2 rounded bg-amber-500/10 text-amber-400 mt-0.5">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-text-primary text-[11px] block">Revision Alert</span>
                  <p className="text-text-muted text-[11px] leading-relaxed">{recommendations.revisionAlert}</p>
                </div>
              </div>

              {/* Card 3: Streak / Habit Boost */}
              <div className="p-3.5 border border-borderColor/50 rounded-lg bg-surface/30 flex items-start gap-2.5">
                <div className="p-2 rounded bg-success/10 text-success mt-0.5">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-text-primary text-[11px] block">Habit Boost</span>
                  <p className="text-text-muted text-[11px] leading-relaxed">{recommendations.habitBoost}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-text-muted italic">
              Click Sync Advice to load personalized suggestions.
            </div>
          )}
        </div>

      {/* Section C: Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Goals Active */}
        <div className="p-4 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Goals Active
            </span>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              <motion.span
                key={activeGoalsCount}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {activeGoalsCount}
              </motion.span>
            </p>
          </div>
        </div>

        {/* Stat 2: Tasks Today */}
        <div className="p-4 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/10 text-success border border-success/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Tasks Today
            </span>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              <motion.span
                key={tasksTodayCount}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {tasksTodayCount}
              </motion.span>
            </p>
          </div>
        </div>

        {/* Stat 3: Focus Hours */}
        <div className="p-4 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Focus This Week
            </span>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              <motion.span
                key={weeklyFocusHours}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {weeklyFocusHours}h
              </motion.span>
            </p>
          </div>
        </div>

        {/* Stat 4: Day Streak */}
        <div className="p-4 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10 text-warning border border-warning/20">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Day Streak
            </span>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              <motion.span
                key={dayStreak}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {dayStreak} {dayStreak === 1 ? 'day' : 'days'}
              </motion.span>
            </p>
          </div>
        </div>
      </div>

      {/* Section A: Digital Flower Garden */}
      <section className="border border-borderColor rounded-xl bg-card/20 p-5 glass shadow-card relative">
        <div className="flex items-center justify-between mb-4 border-b border-borderColor/50 pb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              🌸 Digital Flower Garden
            </h2>
            <p className="text-[10px] text-text-muted mt-0.5">
              Your goals are visual flowers. Keep tasks completed to help them bloom!
            </p>
          </div>
        </div>
        <FlowerGarden />
      </section>

      {/* Section B: Activity Heatmap */}
      <section className="border border-borderColor rounded-xl bg-card/20 p-5 glass shadow-card relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-borderColor/50 pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              📊 Workspace Activity Matrix
            </h2>
            <p className="text-[10px] text-text-muted mt-0.5">
              Visual contribution tracker showing completed study tasks and logged focus hours.
            </p>
          </div>

          {/* Month Navigation Control */}
          <div className="flex items-center gap-3 bg-surface/50 border border-borderColor/45 px-3 py-1 rounded-lg">
            <button
              onClick={handlePrevMonth}
              className="text-text-muted hover:text-text-primary text-sm font-bold px-1.5 focus:outline-none transition-colors"
              title="Previous Month"
            >
              &lt;
            </button>
            <span className="text-xs font-bold text-text-primary select-none whitespace-nowrap">
              {format(matrixDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="text-text-muted hover:text-text-primary text-sm font-bold px-1.5 focus:outline-none transition-colors"
              title="Next Month"
            >
              &gt;
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-text-muted">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded bg-white/[0.03] border border-white/[0.01]" />
            <span className="w-2.5 h-2.5 rounded bg-cyan-900/40" />
            <span className="w-2.5 h-2.5 rounded bg-cyan-700/60" />
            <span className="w-2.5 h-2.5 rounded bg-cyan-500/80" />
            <span className="w-2.5 h-2.5 rounded bg-accent" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid container */}
        <div className="relative overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex flex-col gap-2 min-w-[320px] max-w-sm select-none mx-auto p-1">
            {/* Weekdays Columns Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-text-muted font-semibold pb-1 border-b border-borderColor/20">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid (rows of weeks, cols of Sun-Sat) */}
            <div className="grid grid-cols-7 gap-2">
              {monthGridDays.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredCell(day)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-full aspect-square rounded-[4px] border transition-all duration-150 cursor-pointer flex items-center justify-center text-[9px] relative ${
                    day.isCurrentMonthDay 
                      ? getCellColor(day.score) 
                      : 'bg-transparent border-transparent pointer-events-none'
                  }`}
                >
                  {day.isCurrentMonthDay && (
                    <span className="opacity-80 font-medium">
                      {format(new Date(day.date + 'T00:00:00'), 'd')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Tooltip display */}
        <div className="h-6 flex items-center gap-1 text-[10px] text-text-muted mt-1 bg-surface/30 px-3 py-1 rounded border border-borderColor/30 w-fit">
          <Info className="h-3 w-3 text-primary" />
          {hoveredCell ? (
            <span>
              <strong>{hoveredCell.date}</strong>: {hoveredCell.completedTasks} task{hoveredCell.completedTasks === 1 ? '' : 's'} completed • {hoveredCell.focusHours} focus hour{hoveredCell.focusHours === 1 ? '' : 's'}
            </span>
          ) : (
            <span>Hover over cells in the grid to view details</span>
          )}
        </div>
      </section>

      {/* Add Goal Modal */}
      <Modal isOpen={addGoalOpen} onClose={() => setAddGoalOpen(false)} title="Plant a New Goal">
        <form onSubmit={handleCreateGoalSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-2.5 bg-danger/10 border border-danger/25 text-danger rounded font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Goal Name*
            </label>
            <input
              type="text"
              placeholder="e.g. Master React and NextJS"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1.5">
              Plant Species*
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Rose', color: '#f43f5e' },
                { name: 'Lotus', color: '#f472b6' },
                { name: 'Sunflower', color: '#facc15' },
                { name: 'Lavender', color: '#a855f7' },
                { name: 'Marigold', color: '#f59e0b' },
                { name: 'Lily', color: '#f8fafc' },
                { name: 'Tulip', color: '#fb923c' },
                { name: 'Hydrangea', color: '#60a5fa' },
                { name: 'Hibiscus', color: '#ef4444' }
              ].map((species) => {
                const isSelected = goalFlowerType === species.name;
                return (
                  <button
                    key={species.name}
                    type="button"
                    onClick={() => setGoalFlowerType(species.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-full text-[10px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-text-primary'
                        : 'bg-surface border-borderColor text-text-muted hover:border-borderColor/80'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: species.color }} />
                    {species.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Category
              </label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Learning">Learning</option>
                <option value="Career">Career</option>
                <option value="Fitness">Fitness</option>
                <option value="Project">Project</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Hours/Week
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Time Period*
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
              <option value="Custom date">Custom date</option>
            </select>
          </div>

          {timePeriod === 'Custom date' && (
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Custom Deadline Date*
              </label>
              <input
                type="date"
                min={todayStr}
                value={customDeadline}
                onChange={(e) => setCustomDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="p-2.5 bg-surface/50 border border-borderColor rounded-lg">
            <span className="text-[10px] text-text-muted">
              Target Date: <strong className="text-primary">{goalDeadline}</strong>
            </span>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Description
            </label>
            <textarea
              placeholder="Detail your goals, roadmap, and core motivations..."
              rows="3"
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Milestones dynamic list */}
          <div>
            <label className="block font-semibold text-text-primary mb-1.5 flex items-center justify-between">
              <span>Milestones Checklist</span>
              <button
                type="button"
                onClick={handleAddMilestoneInput}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                + Add Milestone
              </button>
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {goalMilestones.map((m, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Milestone #${idx + 1}`}
                  value={m}
                  onChange={(e) => handleMilestoneInputChange(idx, e.target.value)}
                  className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-borderColor pt-3 mt-4">
            <Button variant="secondary" onClick={() => setAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Sprout Botanical Goal Seed
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
