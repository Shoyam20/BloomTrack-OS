import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Check, ChevronRight, ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../hooks/useToast'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// --- Reusable Subcomponents ---

function FloatingInput({
  id,
  type = 'text',
  label,
  value,
  onChange,
  error
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
          className="block py-2.5 px-0 w-full text-sm text-slate-800 bg-transparent border-0 border-b-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-[#6C3FC5] peer transition-colors duration-200"
        />
        <label
          htmlFor={id}
          className="absolute text-sm text-slate-500 duration-200 transform -translate-y-5 scale-75 top-2.5 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-[#6C3FC5] transition-all"
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
          className="block py-2.5 px-0 w-full text-sm text-slate-800 bg-transparent border-0 border-b-2 border-slate-200 focus:outline-none focus:ring-0 focus:border-[#6C3FC5] peer transition-colors duration-200"
        >
          <option value="" disabled className="text-slate-400">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-800 bg-white">
              {opt}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className="absolute text-sm text-slate-500 duration-200 transform -translate-y-5 scale-75 top-2.5 -z-10 origin-[0] peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-[#6C3FC5] transition-all scale-75 -translate-y-5 text-[#6C3FC5]"
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

export default function CompleteProfile() {
  const { user, profile, upsertProfile } = useStore()
  const { toast } = useToast()
  
  const [step, setStep] = useState(1) // 1: Profession details, 2: Goals
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Form states
  const [profession, setProfession] = useState('')
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

  // Goals
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

  const handleInputChange = (setter, field) => (val) => {
    setter(val)
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validateStep1 = () => {
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

  const handleComplete = async (skipGoals = false) => {
    setIsLoading(true)
    const goalsData = skipGoals ? [] : selectedGoals
    const hoursData = skipGoals ? 0 : dailyHours

    const updatedProfile = {
      full_name: profile?.full_name || user?.user_metadata?.full_name || '',
      email: profile?.email || user?.email || '',
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
      await upsertProfile(updatedProfile)
      toast.success('Profile completed successfully! Welcome ✓')
    } catch (err) {
      console.error('Error completing profile:', err)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => {
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
          <h2 className="text-xl font-bold text-slate-900 mb-1">What best describes you?</h2>
          <p className="text-xs text-slate-500">Help us customize your workspace components.</p>
        </div>

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
                    ? 'border-[#6C3FC5] bg-[#6C3FC5]/5 text-[#6C3FC5] font-semibold scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:scale-[1.01]'
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
                  <span className="text-xs font-medium text-slate-500">Years of Experience</span>
                  <span className="text-xs font-semibold text-[#6C3FC5]">{experience} {experience === 1 ? 'year' : 'years'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6C3FC5]"
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

        <button
          type="button"
          onClick={() => {
            if (validateStep1()) {
              setStep(2)
              setErrors({})
            }
          }}
          className="w-full py-3 mt-4 bg-gradient-to-r from-[#6C3FC5] to-[#9B5DE5] hover:opacity-95 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <span>Next: Goals</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <div className="text-left mb-5">
          <h2 className="text-xl font-bold text-slate-900 mb-1">What do you want to achieve?</h2>
          <p className="text-xs text-slate-500">Configure your key focus goals. You can skip this step.</p>
        </div>

        <div className="text-left mb-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
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
                      ? 'bg-[#6C3FC5] border-[#6C3FC5] text-white font-semibold shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>

        <div className="text-left mb-8">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-500">Daily Dedicated Hours</span>
            <span className="text-xs font-bold text-[#6C3FC5] bg-[#6C3FC5]/10 px-2 py-0.5 rounded">
              {dailyHours} {dailyHours === 1 ? 'hour' : 'hours'}/day
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            value={dailyHours}
            onChange={(e) => setDailyHours(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6C3FC5]"
          />
        </div>

        <div className="flex flex-col gap-2.5 mt-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setErrors({})
              }}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1 focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => handleComplete(false)}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-[#6C3FC5] to-[#9B5DE5] hover:opacity-95 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 focus:outline-none"
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
            onClick={() => handleComplete(true)}
            disabled={isLoading}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors focus:outline-none"
          >
            Skip goals & finish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 registration-page">
      <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl shadow-xl p-8 text-slate-800">
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6C3FC5] flex items-center justify-center shadow-md shadow-purple-200">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">BloomTrack OS</h1>
            <p className="text-[10px] text-slate-500 font-medium">Complete your personal profile.</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="w-full mb-6 text-left select-none">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-[#6C3FC5] uppercase tracking-wider">
              Step {step} of 2
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {step === 1 ? 'Personalize Profession' : 'Define Goals'}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6C3FC5] to-[#9B5DE5] transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep1()}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep2()}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
