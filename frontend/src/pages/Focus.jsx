import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Award, CheckCircle, Volume2, VolumeX, BarChart3, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import { useToast } from '../hooks/useToast'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'

export default function Focus() {
  const { focusSessions, tasks, addFocusSession } = useStore()
  const { toast } = useToast()

  // Timer configuration states
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [preset, setPreset] = useState(25)

  // Running states
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  
  // Custom audio configuration
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [linkedTaskId, setLinkedTaskId] = useState('')

  const timerRef = useRef(null)

  // Ask for notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Sync preset changes with seconds count
  const handlePresetClick = (min) => {
    setPreset(min)
    setHours(0)
    setMinutes(min)
    setSeconds(0)
    const secs = min * 60
    setTotalSeconds(secs)
    setSecondsLeft(secs)
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Handle Custom Input Changes
  const handleCustomTimeUpdate = (h, m, s) => {
    setPreset(0) // custom
    const secs = h * 3600 + m * 60 + s
    setTotalSeconds(secs)
    setSecondsLeft(secs)
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Synthesize pleasant sound chime using Web Audio API (cross-browser compatible)
  const playSynthesizedChime = () => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      
      // Node 1: Oscillator
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      // Volume envelope
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
      
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.0)
    } catch (e) {
      console.error('Failed to play AudioContext chime:', e)
    }
  }

  // Trigger Completion Side-effects
  const handleTimerComplete = () => {
    setIsRunning(false)
    playSynthesizedChime()

    // Trigger Native Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Complete! 🎯', {
        body: `Great job completing your ${Math.round(totalSeconds / 60)} minute focus session. Take a break!`,
        icon: '/src/components/flowers/FlowerSVG.jsx'
      })
    }

    // Add session to Zustand store
    const sessionDuration = Math.round(totalSeconds / 60)
    addFocusSession({
      duration: sessionDuration,
      taskId: linkedTaskId
    })

    toast.success(`🎯 Session completed! ${sessionDuration} focus minutes logged.`)
    
    // Reset to preset
    setSecondsLeft(totalSeconds)
  }

  // Core Timer Interval loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, totalSeconds, linkedTaskId, soundEnabled])

  // Timer Controls
  const toggleStart = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Formatting helper: seconds to HH:MM:SS
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].filter(Boolean).join(':')
  }

  // SVG Progress Ring calculations
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progressRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 0
  const strokeDashoffset = circumference * (1 - progressRatio)

  // CALCULATE ANALYTICS
  const today = startOfDay(new Date())
  
  // 1. Today's focus time
  const todayMinutes = focusSessions
    .filter((fs) => isSameDay(new Date(fs.completedAt), today))
    .reduce((sum, fs) => sum + fs.duration, 0)

  // 2. Weekly focus sessions count
  const oneWeekAgo = subDays(today, 7)
  const weeklySessionsCount = focusSessions.filter(
    (fs) => new Date(fs.completedAt) >= oneWeekAgo
  ).length

  // 3. Longest session
  const longestSessionMinutes = focusSessions.length > 0
    ? Math.max(...focusSessions.map((fs) => fs.duration))
    : 0

  // 4. Generate last 7 days bar data
  const generateWeeklyBarData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const dayToCheck = subDays(today, i)
      const dayLabel = format(dayToCheck, 'EEE')
      
      const dayMinutes = focusSessions
        .filter((fs) => isSameDay(new Date(fs.completedAt), dayToCheck))
        .reduce((sum, fs) => sum + fs.duration, 0)
      
      data.push({
        label: dayLabel,
        minutes: dayMinutes
      })
    }
    return data
  }

  const weeklyBarData = generateWeeklyBarData()
  const maxBarMinutes = Math.max(...weeklyBarData.map((d) => d.minutes), 30) // fallback base 30m

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto px-4">
      
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-text-primary">Focus Workspace</h1>
        <p className="text-xs text-text-muted mt-1">
          Stay productive with Pomodoro timers. Block distractions and log concentration metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left / Center: Circular Timer and Selectors */}
        <div className="md:col-span-2 border border-borderColor rounded-xl bg-card/20 p-6 glass shadow-card flex flex-col items-center justify-center gap-6">
          
          {/* Preset buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap w-full">
            {[25, 45, 60, 90].map((min) => (
              <button
                key={min}
                onClick={() => handlePresetClick(min)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  preset === min
                    ? 'bg-primary border-transparent text-white'
                    : 'bg-surface border-borderColor text-text-muted hover:text-text-primary'
                }`}
              >
                {min} min
              </button>
            ))}
            
            {/* Custom Input modal button */}
            <button
              onClick={() => {
                setPreset(0)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                preset === 0
                  ? 'bg-primary border-transparent text-white'
                  : 'bg-surface border-borderColor text-text-muted hover:text-text-primary'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Dynamic Custom Time picker */}
          {preset === 0 && (
            <div className="flex items-center gap-3 p-3 bg-surface/50 border border-borderColor rounded-lg text-xs">
              <div>
                <label className="block text-[10px] text-text-muted mb-0.5">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={hours}
                  onChange={(e) => {
                    const h = Math.min(12, Math.max(0, parseInt(e.target.value) || 0))
                    setHours(h)
                    handleCustomTimeUpdate(h, minutes, seconds)
                  }}
                  className="w-12 px-1.5 py-1 border border-borderColor rounded bg-background text-text-primary text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-0.5">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                    setMinutes(m)
                    handleCustomTimeUpdate(hours, m, seconds)
                  }}
                  className="w-12 px-1.5 py-1 border border-borderColor rounded bg-background text-text-primary text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-0.5">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => {
                    const s = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                    setSeconds(s)
                    handleCustomTimeUpdate(hours, minutes, s)
                  }}
                  className="w-12 px-1.5 py-1 border border-borderColor rounded bg-background text-text-primary text-center"
                />
              </div>
            </div>
          )}

          {/* Large circular display */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="var(--border)"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                stroke="var(--accent)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.1, ease: 'linear' }}
                strokeLinecap="round"
                className="shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              />
            </svg>

            {/* Time String overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-1">
                {isRunning ? 'Flow state active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Link Task Dropdown */}
          <div className="w-full max-w-xs text-xs space-y-1">
            <label className="block text-text-muted font-semibold">Associate Task</label>
            <select
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
              className="w-full px-3 py-2 border border-borderColor rounded bg-surface text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">No task linked</option>
              {tasks
                .filter((t) => t.status !== 'Done')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>

          {/* controls panel */}
          <div className="flex items-center justify-center gap-4">
            {/* Chime Switcher */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 border rounded-full border-borderColor bg-surface hover:bg-card transition-all ${
                soundEnabled ? 'text-accent' : 'text-text-muted'
              }`}
              title="Toggle completed sound chimes"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* Start / Pause */}
            <Button
              onClick={toggleStart}
              variant={isRunning ? 'secondary' : 'accent'}
              className="px-6 py-2.5 rounded-full font-bold flex items-center gap-1.5 shadow-md"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4.5 w-4.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5" /> Start Focus
                </>
              )}
            </Button>

            {/* Reset */}
            <button
              onClick={resetTimer}
              className="p-2 border rounded-full border-borderColor bg-surface hover:bg-card text-text-muted hover:text-text-primary transition-all"
              title="Reset countdown"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* Right Sidebar: Quick stats & Weekly analytics */}
        <div className="space-y-6 flex flex-col">
          
          {/* stats grid card */}
          <div className="border border-borderColor rounded-xl bg-card/20 p-5 glass shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 border-b border-borderColor/40 pb-2.5">
              <Award className="h-4 w-4 text-accent" /> Focus Record
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Today&apos;s Focus</span>
                <span className="font-bold text-text-primary">{todayMinutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Weekly sessions</span>
                <span className="font-bold text-text-primary">{weeklySessionsCount} sessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Longest Session</span>
                <span className="font-bold text-text-primary">{longestSessionMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Weekly Bar Chart card */}
          <div className="border border-borderColor rounded-xl bg-card/20 p-5 glass shadow-card flex-1 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 border-b border-borderColor/40 pb-2.5 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" /> Daily Distribution
            </h3>

            {/* Graphic Rows */}
            <div className="flex items-end justify-between h-36 px-2 select-none">
              {weeklyBarData.map((d, index) => {
                const heightPercent = Math.min(100, (d.minutes / maxBarMinutes) * 100)
                return (
                  <div key={index} className="flex flex-col items-center gap-1.5 flex-1 group">
                    {/* Tooltip bar indicator */}
                    <div className="relative w-full flex justify-center">
                      <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-borderColor text-[8px] text-text-primary font-bold px-1 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                        {d.minutes}m
                      </span>
                    </div>
                    {/* Bar Pillar */}
                    <div className="w-6 bg-surface border border-borderColor/60 rounded-t-md overflow-hidden h-28 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-primary to-accent rounded-t"
                      />
                    </div>
                    {/* Day label */}
                    <span className="text-[9px] font-semibold text-text-muted">{d.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="p-4 border border-borderColor rounded-xl bg-primary/5 glass text-xs flex gap-3 relative">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-text-primary">AI Productivity tip</p>
              <p className="text-text-muted mt-1 leading-relaxed text-[10px]">
                {focusSessions.length > 0
                  ? 'Based on your history, you focus best between 9am–11am. Try blocking that time for high-priority tasks tomorrow.'
                  : 'Complete a few focus sessions! Your AI Assistant will analyze your data and recommend peak productivity hours.'}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
