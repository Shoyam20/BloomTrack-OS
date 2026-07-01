import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, ArrowRight, ArrowLeft, Check, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useToast } from '../hooks/useToast'

// --- Reusable Subcomponents (Dark Theme) ---

function FloatingInput({
  id,
  type = 'text',
  label,
  value,
  onChange,
  error,
  rightElement = null
}) {
  return (
    <div className="mb-5 text-left">
      <div className="relative z-0 w-full group">
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          className="block py-2.5 px-0 w-full text-sm text-slate-100 bg-transparent border-0 border-b-2 border-slate-800 appearance-none focus:outline-none focus:ring-0 focus:border-[#06b6d4] peer transition-colors duration-200"
        />
        <label
          htmlFor={id}
          className="absolute text-sm text-slate-400 duration-200 transform -translate-y-5 scale-75 top-2.5 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-[#06b6d4] transition-all"
        >
          {label}
        </label>
        {rightElement && (
          <div className="absolute right-0 bottom-2 flex items-center z-10">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}

function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
  error
}) {
  return (
    <div className="mb-5 text-left">
      <div className="relative z-0 w-full group">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-slate-100 bg-transparent border-0 border-b-2 border-slate-800 focus:outline-none focus:ring-0 focus:border-[#06b6d4] peer transition-colors duration-200"
        >
          <option value="" disabled className="text-slate-400 bg-[#151821]">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-200 bg-[#151821]">
              {opt}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className="absolute text-sm text-slate-400 duration-200 transform -translate-y-5 scale-75 top-2.5 -z-10 origin-[0] peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-[#06b6d4] transition-all scale-75 -translate-y-5 text-[#06b6d4]"
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}

export default function SignIn() {
  const [view, setView] = useState('login') // 'login' | 'register'
  const [registerStep, setRegisterStep] = useState(1) // 1 | 2 | 3
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const loginUser = useStore((state) => state.loginUser)
  const registerUser = useStore((state) => state.registerUser)
  const setIsRegistering = useStore((state) => state.setIsRegistering)
  const { toast } = useToast()

  // Form Field States
  const [loginName, setLoginName] = useState('')

  // Register Form States
  const [regName, setRegName] = useState('')

  // Register Step 2
  const [profession, setProfession] = useState('') // School Student, College Student, Working Professional, Entrepreneur, Other
  
  // Conditional fields
  const [schoolName, setSchoolName] = useState('')
  const [schoolGrade, setSchoolGrade] = useState('')
  const [schoolBoard, setSchoolBoard] = useState('')

  const [collegeName, setCollegeName] = useState('')
  const [collegeDegree, setCollegeDegree] = useState('')
  const [collegeBranch, setCollegeBranch] = useState('')
  const [collegeYear, setCollegeYear] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [experience, setExperience] = useState(2)

  const [startupName, setStartupName] = useState('')
  const [startupIndustry, setStartupIndustry] = useState('')
  const [startupStage, setStartupStage] = useState('')

  const [otherDescription, setOtherDescription] = useState('')

  // Register Step 3
  const [selectedGoals, setSelectedGoals] = useState([])
  const [dailyHours, setDailyHours] = useState(4)

  const availableGoals = [
    'Crack placements',
    'Learn DSA',
    'Build projects',
    'Improve productivity',
    'Prepare for exams',
    'Career switch',
    'Other'
  ]

  // Motivational quotes
  const quotes = [
    { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear, Atomic Habits" },
    { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "Focus on progress, not perfection.", author: "BloomTrack OS" },
    { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" }
  ]
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  // --- Handlers ---

  const handleInputChange = (setter, field) => (val) => {
    setter(val)
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    const newErrors = {}
    if (!loginName.trim()) {
      newErrors.loginName = 'Name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    // Lookup user in localStorage
    const success = loginUser(loginName)
    if (success) {
      toast.success(`Successfully logged in as ${loginName} ✓`)
    } else {
      toast.error('Workspace name not found. Redirecting to registration...')
      setRegName(loginName) // Prefill registration name
      setView('register')
      setRegisterStep(1)
    }
    setIsLoading(false)
  }

  // Register Steps validation
  const validateStep1 = () => {
    const newErrors = {}
    if (!regName.trim()) {
      newErrors.regName = 'Full Name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    // Check if name already exists in localStorage
    const users = JSON.parse(localStorage.getItem('bloomtrack_user') || '{}')
    const matchedKey = Object.keys(users).find(
      (key) => key.toLowerCase() === regName.trim().toLowerCase()
    )
    if (matchedKey) {
      setErrors({ regName: 'A workspace with this name already exists. Please login or choose a different name.' })
      toast.error('Workspace already exists')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!profession) {
      newErrors.profession = 'Please select your profession'
      setErrors(newErrors)
      return false
    }

    if (profession === 'School Student') {
      if (!schoolName.trim()) newErrors.schoolName = 'School Name is required'
      if (!schoolGrade) newErrors.schoolGrade = 'Grade is required'
      if (!schoolBoard) newErrors.schoolBoard = 'Board is required'
    } else if (profession === 'College Student') {
      if (!collegeName.trim()) newErrors.collegeName = 'College Name is required'
      if (!collegeDegree.trim()) newErrors.collegeDegree = 'Course / Degree is required'
      if (!collegeBranch.trim()) newErrors.collegeBranch = 'Branch / Specialization is required'
      if (!collegeYear) newErrors.collegeYear = 'Current Year is required'
    } else if (profession === 'Working Professional') {
      if (!companyName.trim()) newErrors.companyName = 'Company Name is required'
      if (!jobRole.trim()) newErrors.jobRole = 'Job Role is required'
    } else if (profession === 'Entrepreneur') {
      if (!startupName.trim()) newErrors.startupName = 'Startup Name is required'
      if (!startupIndustry.trim()) newErrors.startupIndustry = 'Industry is required'
      if (!startupStage) newErrors.startupStage = 'Startup Stage is required'
    } else if (profession === 'Other') {
      if (!otherDescription.trim()) newErrors.otherDescription = 'Please describe yourself'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }
    return true
  }

  const handleRegisterComplete = async (skipGoals = false) => {
    setIsLoading(true)
    setIsRegistering(true)

    // Build the final profile data structure
    const goalsData = skipGoals ? [] : selectedGoals
    const hoursData = skipGoals ? 0 : dailyHours

    const profileData = {
      full_name: regName.trim(),
      email: null, // Removed email
      profession,
      school_name: profession === 'School Student' ? schoolName : null,
      grade: profession === 'School Student' ? schoolGrade : null,
      board: profession === 'School Student' ? schoolBoard : null,
      college_name: profession === 'College Student' ? collegeName : null,
      degree: profession === 'College Student' ? collegeDegree : null,
      branch: profession === 'College Student' ? collegeBranch : null,
      year: profession === 'College Student' ? collegeYear : null,
      company_name: profession === 'Working Professional' ? companyName : null,
      job_role: profession === 'Working Professional' ? jobRole : null,
      experience: profession === 'Working Professional' ? experience : null,
      startup_name: profession === 'Entrepreneur' ? startupName : null,
      industry: profession === 'Entrepreneur' ? startupIndustry : null,
      stage: profession === 'Entrepreneur' ? startupStage : null,
      description: profession === 'Other' ? otherDescription : null,
      goals: goalsData,
      daily_hours: hoursData
    }

    try {
      // Save profile & initial user state locally
      registerUser(profileData)
      toast.success('Registration successful! Welcome to BloomTrack OS ✓')
    } catch (err) {
      console.error('Registration error:', err)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsRegistering(false)
      setIsLoading(false)
    }
  }

  // --- Rendering UI Helpers (Themed to Dark) ---

  const renderLeftPanel = () => {
    return (
      <div className="relative w-full lg:w-3/5 min-h-[360px] lg:min-h-screen bg-gradient-to-br from-[#0c0f16] to-[#0a0a0f] flex flex-col justify-between p-8 lg:p-16 text-slate-100 overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-white/[0.06]">
        {/* Decorative floating blurred background shapes */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[10%] left-[10%] w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            y: [15, -15, 15],
            x: [15, -15, 15],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[10%] right-[10%] w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"
        />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 p-[1px] flex items-center justify-center backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Compass className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">BloomTrack OS</h1>
            <p className="text-[10px] text-cyan-500 font-semibold tracking-wider uppercase">Your personal OS for growth.</p>
          </div>
        </div>

        {/* Center Illustration - Beautiful Blooming Plant SVG styled with cyan/blue accents */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Pulsing glow ring */}
            <div className="absolute inset-0 rounded-full border border-[#06b6d4]/10 scale-110 animate-pulse pointer-events-none" />

            <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {/* Plant Pot */}
              <path d="M32 78C32 78 36 88 50 88C64 88 68 78 68 78H32Z" fill="white" fillOpacity="0.1" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Stem */}
              <path d="M50 78C50 78 49 60 51 45C52.5 35 48 24 48 24" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
              {/* Animated Floating Leaves */}
              <motion.path 
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                d="M51 55C58 55 64 50 67 43C59 43 53 48 51 55Z" 
                fill="#0891b2" 
                fillOpacity="0.75" 
              />
              <motion.path 
                animate={{ rotate: [2, -2, 2] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                d="M49 47C42 47 36 42 33 35C41 35 47 40 49 47Z" 
                fill="#0891b2" 
                fillOpacity="0.75" 
              />
              {/* Flower Bloom */}
              <motion.circle 
                animate={{ scale: [0.96, 1.04, 0.96] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                cx="48" cy="22" r="7" 
                fill="#06b6d4" 
              />
              <circle cx="41" cy="22" r="4.5" fill="#3b82f6" fillOpacity="0.6" />
              <circle cx="55" cy="22" r="4.5" fill="#3b82f6" fillOpacity="0.6" />
              <circle cx="48" cy="15" r="4.5" fill="#3b82f6" fillOpacity="0.6" />
              <circle cx="48" cy="29" r="4.5" fill="#3b82f6" fillOpacity="0.6" />
              <circle cx="48" cy="22" r="2.5" fill="#22c55e" />
            </svg>
          </motion.div>
        </div>

        {/* Bottom Left Quote */}
        <div className="relative z-10 mt-auto text-left max-w-md hidden lg:block">
          <p className="text-sm font-light italic text-slate-300 leading-relaxed mb-1.5">
            "{quote.text}"
          </p>
          <p className="text-xs font-semibold text-cyan-500">— {quote.author}</p>
        </div>
      </div>
    )
  }

  const renderLoginForm = () => {
    return (
      <div className="w-full text-slate-200">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 text-slate-100 text-left">
          Welcome back
        </h2>
        <p className="text-sm text-slate-400 mb-8 text-left font-medium">
          Sign in to your personal workspace to continue growing.
        </p>

        {errors.form && (
          <div className="mb-5 p-3 rounded-lg border border-red-950 bg-red-950/20 text-red-400 text-xs font-medium text-left border-red-500/20">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <FloatingInput
            id="login-name"
            label="Enter your name"
            value={loginName}
            onChange={handleInputChange(setLoginName, 'loginName')}
            error={errors.loginName}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-cyan-950/30 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? <LoadingSpinner className="h-4 w-4 text-white" /> : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              setView('register')
              setRegisterStep(1)
              setErrors({})
            }}
            className="text-cyan-400 font-bold hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    )
  }

  const renderRegisterStep1 = () => {
    return (
      <div className="space-y-6">
        <div className="text-left mb-4">
          <h2 className="text-lg font-bold text-slate-100 mb-1">Tell us your name</h2>
          <p className="text-xs text-slate-400">First, let's configure your workspace identity.</p>
        </div>

        <FloatingInput
          id="reg-name"
          label="Full Name"
          value={regName}
          onChange={handleInputChange(setRegName, 'regName')}
          error={errors.regName}
        />

        <button
          type="button"
          onClick={() => {
            if (validateStep1()) {
              setRegisterStep(2)
              setErrors({})
            }
          }}
          disabled={isLoading || !regName.trim()}
          className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-cyan-950/30 flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
        >
          <span>Next: Profession</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const renderRegisterStep2 = () => {
    const professions = [
      { id: 'School Student', label: 'School Student', emoji: '🎒' },
      { id: 'College Student', label: 'College Student', emoji: '🎓' },
      { id: 'Working Professional', label: 'Working Professional', emoji: '💼' },
      { id: 'Entrepreneur', label: 'Entrepreneur', emoji: '🚀' },
      { id: 'Other', label: 'Other', emoji: '🎨' }
    ]

    return (
      <div className="space-y-4">
        <div className="text-left mb-4">
          <h2 className="text-lg font-bold text-slate-100 mb-1">What best describes you?</h2>
          <p className="text-xs text-slate-400">Help us customize your workspace components.</p>
        </div>

        {/* Profession Cards grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {professions.map((prof) => {
            const isSelected = profession === prof.id
            return (
              <button
                key={prof.id}
                type="button"
                onClick={() => {
                  setProfession(prof.id)
                  setErrors(prev => ({ ...prev, profession: null }))
                }}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-cyan-400 font-semibold scale-[1.02]'
                    : 'border-slate-800 bg-[#11131a] hover:border-slate-750 text-slate-400 hover:scale-[1.01]'
                }`}
              >
                <span className="text-2xl mb-1.5">{prof.emoji}</span>
                <span className="text-xs">{prof.label}</span>
              </button>
            )
          })}
        </div>
        {errors.profession && (
          <p className="text-xs text-red-500 font-medium text-left mt-[-10px] mb-3">{errors.profession}</p>
        )}

        {/* Conditional inputs */}
        <AnimatePresence mode="wait">
          {profession === 'School Student' && (
            <motion.div
              key="school"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <FloatingInput
                id="school-name"
                label="School Name"
                value={schoolName}
                onChange={handleInputChange(setSchoolName, 'schoolName')}
                error={errors.schoolName}
              />
              <div className="grid grid-cols-2 gap-4">
                <FloatingSelect
                  id="school-grade"
                  label="Class / Grade"
                  value={schoolGrade}
                  onChange={handleInputChange(setSchoolGrade, 'schoolGrade')}
                  options={['6th', '7th', '8th', '9th', '10th', '11th', '12th']}
                  error={errors.schoolGrade}
                />
                <FloatingSelect
                  id="school-board"
                  label="Board"
                  value={schoolBoard}
                  onChange={handleInputChange(setSchoolBoard, 'schoolBoard')}
                  options={['CBSE', 'ICSE', 'State Board', 'Other']}
                  error={errors.schoolBoard}
                />
              </div>
            </motion.div>
          )}

          {profession === 'College Student' && (
            <motion.div
              key="college"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <FloatingInput
                id="college-name"
                label="College / University Name"
                value={collegeName}
                onChange={handleInputChange(setCollegeName, 'collegeName')}
                error={errors.collegeName}
              />
              <FloatingInput
                id="college-degree"
                label="Course / Degree (e.g. B.Tech, BCA)"
                value={collegeDegree}
                onChange={handleInputChange(setCollegeDegree, 'collegeDegree')}
                error={errors.collegeDegree}
              />
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  id="college-branch"
                  label="Branch / Specialization"
                  value={collegeBranch}
                  onChange={handleInputChange(setCollegeBranch, 'collegeBranch')}
                  error={errors.collegeBranch}
                />
                <FloatingSelect
                  id="college-year"
                  label="Current Year"
                  value={collegeYear}
                  onChange={handleInputChange(setCollegeYear, 'collegeYear')}
                  options={['1st', '2nd', '3rd', '4th', '5th']}
                  error={errors.collegeYear}
                />
              </div>
            </motion.div>
          )}

          {profession === 'Working Professional' && (
            <motion.div
              key="pro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <FloatingInput
                id="company-name"
                label="Company Name"
                value={companyName}
                onChange={handleInputChange(setCompanyName, 'companyName')}
                error={errors.companyName}
              />
              <FloatingInput
                id="job-role"
                label="Job Role / Designation"
                value={jobRole}
                onChange={handleInputChange(setJobRole, 'jobRole')}
                error={errors.jobRole}
              />
              <div className="text-left pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-400">Years of Experience</span>
                  <span className="text-xs font-semibold text-cyan-400">{experience} {experience === 1 ? 'year' : 'years'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
                />
              </div>
            </motion.div>
          )}

          {profession === 'Entrepreneur' && (
            <motion.div
              key="founder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <FloatingInput
                id="startup-name"
                label="Startup / Venture Name"
                value={startupName}
                onChange={handleInputChange(setStartupName, 'startupName')}
                error={errors.startupName}
              />
              <FloatingInput
                id="startup-industry"
                label="Industry / Domain"
                value={startupIndustry}
                onChange={handleInputChange(setStartupIndustry, 'startupIndustry')}
                error={errors.startupIndustry}
              />
              <FloatingSelect
                id="startup-stage"
                label="Stage"
                value={startupStage}
                onChange={handleInputChange(setStartupStage, 'startupStage')}
                options={['Idea', 'Building', 'Launched', 'Scaling']}
                error={errors.startupStage}
              />
            </motion.div>
          )}

          {profession === 'Other' && (
            <motion.div
              key="other"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <FloatingInput
                id="other-desc"
                label="Describe yourself in a few words"
                value={otherDescription}
                onChange={handleInputChange(setOtherDescription, 'otherDescription')}
                error={errors.otherDescription}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setRegisterStep(1)
              setErrors({})
            }}
            className="flex-1 py-3 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1 focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (validateStep2()) {
                setRegisterStep(3)
                setErrors({})
              }
            }}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-cyan-950/30 flex items-center justify-center gap-1.5 focus:outline-none"
          >
            <span>Next: Goals</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderRegisterStep3 = () => {
    return (
      <div className="space-y-4">
        <div className="text-left mb-5">
          <h2 className="text-lg font-bold text-slate-100 mb-1">What do you want to achieve?</h2>
          <p className="text-xs text-slate-400">Configure your key focus goals. You can skip this step.</p>
        </div>

        {/* Goals Chips */}
        <div className="text-left mb-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
            Select Goals
          </span>
          <div className="flex flex-wrap gap-2.5 mb-6">
            {availableGoals.map((g) => {
              const isSelected = selectedGoals.includes(g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedGoals(selectedGoals.filter(goal => goal !== g))
                    } else {
                      setSelectedGoals([...selectedGoals, g])
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-transparent text-white font-semibold shadow-sm'
                      : 'bg-[#11131a] border-slate-800 hover:border-slate-750 text-slate-400'
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dedicated Hours Slider */}
        <div className="text-left mb-8">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-400">Daily Dedicated Hours</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/35">
              {dailyHours} {dailyHours === 1 ? 'hour' : 'hours'}/day
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            value={dailyHours}
            onChange={(e) => setDailyHours(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
          />
        </div>

        <div className="flex flex-col gap-2.5 mt-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setRegisterStep(2)
                setErrors({})
              }}
              className="flex-1 py-3 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1 focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => handleRegisterComplete(false)}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-cyan-950/30 flex items-center justify-center gap-1.5 focus:outline-none"
            >
              {isLoading ? <LoadingSpinner className="h-4 w-4 text-white" /> : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Complete</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleRegisterComplete(true)}
            disabled={isLoading}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-350 font-medium transition-colors focus:outline-none"
          >
            Skip goals & finish
          </button>
        </div>
      </div>
    )
  }

  const renderRegisterForm = () => {
    return (
      <div className="w-full text-slate-200">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-100 text-left">
          Join BloomTrack
        </h2>
        <p className="text-sm text-slate-400 mb-6 text-left font-medium">
          Create an account to begin tracking studies and blooming goals.
        </p>

        {/* Step Indicator */}
        <div className="w-full mb-6 text-left select-none">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Step {registerStep} of 3
            </span>
            <span className="text-[10px] text-slate-500 font-bold">
              {registerStep === 1 && 'Personal Credentials'}
              {registerStep === 2 && 'Personalize Profession'}
              {registerStep === 3 && 'Define Goals'}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
              style={{ width: `${(registerStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Multi-step views */}
        <div>
          {registerStep === 1 && renderRegisterStep1()}
          {registerStep === 2 && renderRegisterStep2()}
          {registerStep === 3 && renderRegisterStep3()}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              setView('login')
              setErrors({})
            }}
            className="text-cyan-400 font-bold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#0a0a0f] font-sans text-slate-100 auth-page">
      {/* Left Panel (60%) */}
      {renderLeftPanel()}

      {/* Right Panel (40%) */}
      <div className="relative w-full lg:w-2/5 min-h-[500px] lg:min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center p-8 lg:p-12 text-slate-200">
        
        {/* Pill Badge at the top right */}
        <div className="absolute top-6 right-8 z-10 hidden sm:block select-none">
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-cyan-950/40 text-cyan-400 uppercase tracking-wider border border-cyan-800/35">
            {view === 'login' ? 'Welcome back' : 'Join free'}
          </span>
        </div>

        {/* Main Form Box (Card Styling matching Dashboard) */}
        <div className="w-full max-w-sm bg-[#151821] border border-white/[0.08] p-8 lg:p-10 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login-view"
                initial={{ x: 15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -15, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                {renderLoginForm()}
              </motion.div>
            )}

            {view === 'register' && (
              <motion.div
                key="register-view"
                initial={{ x: 15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -15, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                {renderRegisterForm()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
