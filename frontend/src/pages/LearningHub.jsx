import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useLearningHubAI } from '../hooks/useLearningHubAI'
import { learningRoadmaps, findCuratedTopicKey, getPracticePlatforms } from '../data/learningHubStaticData'
import { useToast } from '../hooks/useToast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Brain,
  Video,
  FileText,
  Bookmark,
  ExternalLink,
  Award,
  Send,
  HelpCircle,
  RefreshCw,
  Shuffle,
  Star,
  Flame,
  CheckCircle,
  HelpCircle as QuestionIcon,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookmarkCheck,
  Trash2,
  Plus
} from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
const EmptyTopicState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-md mx-auto">
    <div className="p-4 rounded-full bg-primary/10 border border-primary/20 text-primary">
      <BookOpen className="h-10 w-10 animate-pulse" />
    </div>
    <div className="space-y-1.5">
      <h3 className="text-sm font-bold text-text-primary">No Learning Topic Set</h3>
      <p className="text-xs text-text-muted leading-relaxed">
        Please specify a topic or specific learning goal in the left sidebar under "AI Student Profile" to populate your study resources, flashcards, practice quizzes, and coding platforms.
      </p>
    </div>
    <button
      onClick={() => {
        const inputEl = document.getElementById('learning-goal-input');
        if (inputEl) {
          inputEl.focus();
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }}
      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
    >
      Set Learning Goal
    </button>
  </div>
);

export default function LearningHub() {
  const {
    learningHub,
    geminiApiKey,
    profile,
    addTutorMessage,
    clearTutorChat,
    selectTopic,
    updateStudentLearningProfile,
    addXPAwards,
    recordQuizScore,
    garden,
    customResources,
    addCustomResource,
    removeCustomResource
  } = useStore()

  const { toast } = useToast()
  const tutorAI = useLearningHubAI()

  // Local component states
  const [activeTab, setActiveTab] = useState('resources')
  
  // Custom Topic Form
  const [customTopic, setCustomTopic] = useState('')
  const [customCategory, setCustomCategory] = useState('Programming')

  // Form states for adding custom practice platform resource
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceUrl, setNewResourceUrl] = useState('')

  // UI Loaders
  const [loadingTutor, setLoadingTutor] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [loadingFlashcards, setLoadingFlashcards] = useState(false)
  const [loadingQuiz, setLoadingQuiz] = useState(false)

  // Module Data States
  const [resources, setResources] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])

  // Flashcards UI State
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favoriteCards, setFavoriteCards] = useState([])
  const [difficultCards, setDifficultCards] = useState([])

  // Quiz UI State
  const [quizDifficulty, setQuizDifficulty] = useState('Medium')
  const [userAnswers, setUserAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFeedback, setQuizFeedback] = useState(null)

  // Tutor Input State
  const [tutorInput, setTutorInput] = useState('')
  const chatEndRef = useRef(null)

  // Practice checklist (local to session)
  const [completedProblems, setCompletedProblems] = useState({})

  // Topics Catalog
  const topicsCatalog = [
    { name: 'Data Structures: Linked Lists', category: 'Programming' },
    { name: 'Dynamic Programming', category: 'Programming' },
    { name: 'React Hooks & State', category: 'Web Development' },
    { name: 'REST APIs & Fetch', category: 'Web Development' },
    { name: 'Linear Regression Basics', category: 'AI / ML' },
    { name: 'Prompt Engineering', category: 'AI / ML' },
    { name: 'Calculus: Limits & Derivatives', category: 'General subjects' },
    { name: 'Organic Chemistry Basics', category: 'General subjects' }
  ]

  const curatedKey = findCuratedTopicKey(learningHub.selectedTopic)
  const roadmapData = curatedKey ? learningRoadmaps[curatedKey] : null

  // Remove default topic loading on mount
  useEffect(() => {
    const goal = learningHub.learningGoal?.trim()
    if (goal) {
      const cKey = findCuratedTopicKey(goal)
      let category = 'Programming'
      if (cKey) {
        const matchedCatalog = topicsCatalog.find(c => c.name === cKey)
        if (matchedCatalog) {
          category = matchedCatalog.category
        }
      }
      selectTopic(goal, category)
    } else {
      selectTopic('', 'Programming')
    }
  }, [])

  // Sync learningGoal changes to selectedTopic
  useEffect(() => {
    const goal = learningHub.learningGoal?.trim()
    if (goal) {
      const cKey = findCuratedTopicKey(goal)
      let category = 'Programming'
      if (cKey) {
        const matchedCatalog = topicsCatalog.find(c => c.name === cKey)
        if (matchedCatalog) {
          category = matchedCatalog.category
        }
      }
      selectTopic(goal, category)
    } else {
      selectTopic('', 'Programming')
    }
  }, [learningHub.learningGoal])

  // Auto scroll tutor chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [learningHub.tutorChatHistory, loadingTutor])

  // Trigger content loads when topic changes
  useEffect(() => {
    if (learningHub.selectedTopic) {
      loadTopicData()
      // reset tab state
      setCurrentCardIdx(0)
      setIsFlipped(false)
      setUserAnswers({})
      setQuizSubmitted(false)
      setQuizFeedback(null)
      setCompletedProblems({})
    } else {
      setResources([])
      setFlashcards([])
      setQuizQuestions([])
    }
  }, [learningHub.selectedTopic])

  const loadTopicData = () => {
    const topic = learningHub.selectedTopic
    if (!topic) return

    setLoadingResources(true)
    setLoadingFlashcards(true)
    setLoadingQuiz(true)

    // Load static local data synchronously
    const resData = tutorAI.getFallbackResources(topic)
    setResources(resData.resources || [])

    const fcData = tutorAI.getFallbackFlashcards(topic)
    setFlashcards(fcData.flashcards || [])

    const quizData = tutorAI.getFallbackQuiz(topic)
    setQuizQuestions(quizData.questions || [])

    setLoadingResources(false)
    setLoadingFlashcards(false)
    setLoadingQuiz(false)
  }

  // Trigger custom topic submit
  const handleCustomTopicSubmit = (e) => {
    e.preventDefault()
    if (!customTopic.trim()) return
    selectTopic(customTopic.trim(), customCategory)
    setCustomTopic('')
    toast.success(`Active topic changed to "${customTopic.trim()}"!`)
  }

  // Tutor Message Send
  const handleSendTutorMessage = async (e, forcedText = null) => {
    if (e) e.preventDefault()
    const message = forcedText || tutorInput
    if (!message.trim() || loadingTutor) return

    addTutorMessage({ role: 'user', content: message })
    setTutorInput('')
    setLoadingTutor(true)

    try {
      let responseText = ''
      if (geminiApiKey) {
        responseText = await tutorAI.callGemini('tutor', learningHub.selectedTopic, learningHub.selectedCategory, message)
      } else {
        // Fallback tutor simulation response
        responseText = `As your offline AI Tutor studying **${learningHub.selectedTopic}**, here is some guidance on *"${message}"*: \n\n1. Let's look at this concept step-by-step.\n2. **Hint**: Try considering the primary boundary condition before allocating dynamic states.\n3. Can you tell me what you think happens if this boundary is exceeded? \n\n*Configure your Gemini API key in the BloomTrack AI OS settings for live personalized tutoring interactions.*`
      }
      addTutorMessage({ role: 'assistant', content: responseText })
    } catch (err) {
      toast.error('Tutor failed to respond.')
      addTutorMessage({ role: 'assistant', content: 'Apologies, I encountered an issue connecting. Please try again.' })
    } finally {
      setLoadingTutor(false)
    }
  }

  // Flashcards Navigation & Interactions
  const handleStarCard = (idx) => {
    if (favoriteCards.includes(idx)) {
      setFavoriteCards(favoriteCards.filter(id => id !== idx))
      toast.info('Removed from Favorites')
    } else {
      setFavoriteCards([...favoriteCards, idx])
      toast.success('Added to Favorites ★')
    }
  }

  const handleDifficultCard = (idx) => {
    if (difficultCards.includes(idx)) {
      setDifficultCards(difficultCards.filter(id => id !== idx))
      toast.info('Marked as normal')
    } else {
      setDifficultCards([...difficultCards, idx])
      toast.warning('Marked as Difficult ⚠️')
    }
  }

  const handleSpacedRepetition = (difficultyLevel) => {
    // Spaced repetition clicked
    let xp = 5
    let message = ''
    if (difficultyLevel === 'Easy') {
      xp = 15
      message = 'Scheduled revision in 4 days'
    } else if (difficultyLevel === 'Medium') {
      xp = 10
      message = 'Scheduled revision in 2 days'
    } else {
      xp = 5
      message = 'Scheduled revision in 1 day'
    }

    addXPAwards(xp, 2, 'Flashcards', learningHub.selectedTopic)
    toast.success(`Card reviewed! ${message} (+${xp} XP)`)
    
    // Auto advance
    if (currentCardIdx < flashcards.length - 1) {
      setIsFlipped(false)
      setTimeout(() => setCurrentCardIdx(prev => prev + 1), 200)
    }
  }

  const handleShuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setFlashcards(shuffled)
    setCurrentCardIdx(0)
    setIsFlipped(false)
    toast.success('Flashcards shuffled!')
  }

  // Quiz Handling
  const handleQuizAnswer = (qId, val) => {
    setUserAnswers({ ...userAnswers, [qId]: val })
  }

  const handleQuizSubmit = (e) => {
    e.preventDefault()
    if (quizQuestions.length === 0) return

    let correctCount = 0
    quizQuestions.forEach((q) => {
      const userAns = userAnswers[q.id]?.trim()?.toLowerCase()
      const correctAns = q.correctAnswer?.trim()?.toLowerCase()
      if (userAns && correctAns && userAns === correctAns) {
        correctCount++
      }
    })

    setQuizScore(correctCount)
    setQuizSubmitted(true)

    // Call store action
    recordQuizScore(learningHub.selectedTopic, correctCount, quizQuestions.length, quizDifficulty)

    // Generate summary feedback
    const scorePct = correctCount / quizQuestions.length
    let feedback = {
      summary: '',
      weakAreas: '',
      revisionSuggestion: ''
    }

    if (scorePct === 1.0) {
      feedback.summary = '🌟 Perfect Score! You have fully mastered this topic.'
      feedback.weakAreas = 'None! Excellent comprehension.'
      feedback.revisionSuggestion = 'You are ready to advance to harder topics or practice platforms.'
    } else if (scorePct >= 0.6) {
      feedback.summary = '👍 Well Done! You passed the quiz and demonstrated solid understanding.'
      feedback.weakAreas = 'Review the incorrect answers and explanations to shore up detail nuances.'
      feedback.revisionSuggestion = 'Revision frequency is set to normal. Practice coding problems to lock in skills.'
    } else {
      feedback.summary = '⚠️ Practice Required. You struggled with some core concepts.'
      feedback.weakAreas = 'Struggling with fundamentals, syntax boundary checks, or terminology.'
      feedback.revisionSuggestion = 'Revision frequency increased! Flashcards regenerated. Re-study with the AI Tutor and try an easier quiz.'
    }

    setQuizFeedback(feedback)
    toast.success(`Quiz submitted! Score: ${correctCount}/${quizQuestions.length}`)
  }

  const handleRegenerateQuiz = () => {
    setLoadingQuiz(true)
    setQuizSubmitted(false)
    setUserAnswers({})
    const quizData = tutorAI.getFallbackQuiz(learningHub.selectedTopic)
    setQuizQuestions(quizData.questions || [])
    setLoadingQuiz(false)
    toast.success('Quiz updated!')
  }

  // Practice Platform problem logs
  const toggleProblemCheck = (probIdx, points = 20) => {
    const isCompleted = completedProblems[probIdx]
    const updated = { ...completedProblems, [probIdx]: !isCompleted }
    setCompletedProblems(updated)

    if (!isCompleted) {
      addXPAwards(points, 10, 'Practice', learningHub.selectedTopic)
      toast.success(`Completed practice problem! (+${points} XP, +10 Coins) 🍎`)
    }
  }

  // Helper icons
  const getResourceIcon = (type) => {
    switch (type) {
      case 'Video':
        return <Video className="h-5 w-5 text-red-400" />
      case 'Doc':
        return <FileText className="h-5 w-5 text-blue-400" />
      case 'Cheat Sheet':
        return <Bookmark className="h-5 w-5 text-amber-400" />
      default:
        return <BookOpen className="h-5 w-5 text-emerald-400" />
    }
  }

  // Topic Completion
  const handleMarkTopicCompleted = () => {
    addXPAwards(50, 20, 'Lesson', learningHub.selectedTopic)
    toast.success(`🎉 Topic "${learningHub.selectedTopic}" Completed! (+50 XP, +20 Coins)`)
  }

  // Handle adding custom practice platform
  const handleAddCustomResource = (e) => {
    e.preventDefault()
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) {
      toast.error('Please enter both title and URL.')
      return
    }
    let url = newResourceUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    addCustomResource(learningHub.selectedTopic, {
      name: newResourceTitle.trim(),
      url: url,
      desc: 'Self-added practice platform/reference.'
    })
    
    setNewResourceTitle('')
    setNewResourceUrl('')
    toast.success('Custom resource added successfully! 🚀')
  }

  const practiceProblems = [
    { title: 'Easy: Basic Syntax Checkoff', xp: 15 },
    { title: 'Medium: Core Algorithmic Integration', xp: 25 },
    { title: 'Hard: Boundary & Performance Edge Cases', xp: 40 }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
      
      {/* LEFT SIDEBAR: Topic Selector & Student Profile settings */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Profile Settings Adaptive Board */}
        <div className="p-4 border border-borderColor rounded-xl bg-card/45 glass shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-borderColor/40 pb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Student Profile</h3>
          </div>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-text-muted mb-1">Education / Focus Level</label>
              <select
                value={learningHub.studentProfile}
                onChange={(e) => updateStudentLearningProfile({ studentProfile: e.target.value })}
                className="w-full px-2 py-1.5 rounded bg-surface border border-borderColor text-text-primary focus:border-primary"
              >
                <option value="School Student">School Student</option>
                <option value="College Student">College Student</option>
                <option value="Competitive Exam Aspirant">Competitive Exam Aspirant</option>
                <option value="Programming Learner">Programming Learner</option>
                <option value="AI Learner">AI Learner</option>
                <option value="Self Learner">Self Learner</option>
              </select>
            </div>

            <div>
              <label className="block text-text-muted mb-1">Current Skill Level</label>
              <select
                value={learningHub.skillLevel}
                onChange={(e) => updateStudentLearningProfile({ skillLevel: e.target.value })}
                className="w-full px-2 py-1.5 rounded bg-surface border border-borderColor text-text-primary focus:border-primary"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-text-muted mb-1">Specific Learning Goal</label>
              <input
                id="learning-goal-input"
                type="text"
                placeholder="e.g. Pass midterms, get coding job"
                value={learningHub.learningGoal}
                onChange={(e) => updateStudentLearningProfile({ learningGoal: e.target.value })}
                className="w-full px-2 py-1.5 rounded bg-surface border border-borderColor text-text-primary focus:border-primary placeholder-text-muted"
              />
            </div>
          </div>
        </div>



        {/* Revision Intelligence Warning Box */}
        {learningHub.revisionTopics?.length > 0 && (
          <div className="p-4 border border-warning/30 bg-warning/5 text-warning rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4" />
              <span>Revision Required!</span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              You recently scored low on the following topics. AI Tutor will increase revision alerts:
            </p>
            <ul className="list-disc list-inside text-[11px] text-text-muted pl-1 space-y-1">
              {learningHub.revisionTopics.map(t => <li key={t} className="truncate">{t}</li>)}
            </ul>
          </div>
        )}

      </div>

      {/* MAIN MODULE AREA: Tabs & Interactions */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Header Display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-borderColor rounded-xl bg-card/25 glass">
          <div>
            <span className="text-[10px] text-accent uppercase tracking-wider font-bold">Currently Learning</span>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
              <BookOpen className="h-5 w-5 text-primary" /> {learningHub.selectedTopic || 'Loading...'}
            </h2>
            <p className="text-[11px] text-text-muted mt-1">
              Category: <strong className="text-text-primary">{learningHub.selectedCategory}</strong> • Mode: {geminiApiKey ? <span className="text-success font-semibold">Live AI Tutor</span> : <span className="text-warning font-semibold">Offline Demo</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats display */}
            <div className="text-right text-xs">
              <span className="text-text-muted block text-[10px]">Your XP</span>
              <motion.span
                key={garden.xp}
                initial={{ scale: 1.25, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="font-bold text-accent inline-block"
              >
                {garden.xp} XP
              </motion.span>
            </div>
            <div className="h-8 w-px bg-borderColor" />
            <div className="text-right text-xs">
              <span className="text-text-muted block text-[10px]">Coins</span>
              <motion.span
                key={garden.coins}
                initial={{ scale: 1.25, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="font-bold text-amber-400 inline-block"
              >
                {garden.coins} 🪙
              </motion.span>
            </div>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex border-b border-borderColor overflow-x-auto scrollbar-none gap-2 select-none">
          {[
            { id: 'resources', label: '1. Study Resources', icon: Bookmark },
            { id: 'flashcards', label: '2. Flashcards', icon: Sparkles },
            { id: 'quiz', label: '3. Practice Quiz', icon: QuestionIcon },
            { id: 'practice', label: '4. Practice Platforms', icon: ExternalLink }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all focus:outline-none ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content screens */}
        <div className="min-h-[50vh] border border-borderColor rounded-xl bg-card/10 glass p-5 relative overflow-hidden">
          
          {!learningHub.learningGoal?.trim() ? (
            <EmptyTopicState />
          ) : (
            <>
              {/* TAB 2: STUDY RESOURCES */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <div className="border-b border-borderColor/45 pb-2">
                    <h3 className="text-sm font-bold text-text-primary">Recommended Curriculum & Resources</h3>
                    <p className="text-xs text-text-muted mt-0.5">High quality learning articles, videos, and documentation selected based on your profile goals.</p>
                  </div>

                  {/* Curated Roadmap Banner */}
                  {roadmapData && (
                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Curated Learning Roadmap</span>
                        <h4 className="font-bold text-text-primary text-sm flex items-center gap-1">
                          {roadmapData.title}
                        </h4>
                        <p className="text-text-muted text-[11px] leading-relaxed">{roadmapData.description}</p>
                      </div>
                      <a
                        href={roadmapData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 whitespace-nowrap self-start md:self-center"
                        onClick={() => addXPAwards(10, 5, 'Roadmap Link', learningHub.selectedTopic)}
                      >
                        View Roadmap <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}

                  {loadingResources ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <LoadingSpinner className="h-10 w-10 text-primary mb-2" />
                      <span className="text-xs text-text-muted">Analyzing resources catalog...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {resources.map((res, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className="p-4 border border-borderColor rounded-xl bg-surface/30 hover:bg-surface/50 hover:border-primary/20 transition-all flex items-start gap-3 relative"
                        >
                          <div className="p-2.5 rounded-lg bg-surface border border-borderColor flex-shrink-0">
                            {getResourceIcon(res.type)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-text-primary">{res.title}</span>
                              <Badge variant="accent" className="text-[8px] scale-90 px-1 py-0">{res.type}</Badge>
                            </div>
                            <p className="text-text-muted text-[11px] leading-relaxed">{res.description}</p>
                            
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 pt-1.5 w-fit"
                              onClick={() => addXPAwards(5, 2, 'Resource Link', learningHub.selectedTopic)}
                            >
                              Visit Resource <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {resources.length > 0 && (
                    <div className="flex justify-end pt-4 border-t border-borderColor/45 mt-4">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleMarkTopicCompleted}
                        className="flex items-center gap-1.5 py-1.5 px-4 text-xs font-semibold"
                      >
                        <BookmarkCheck className="h-4 w-4" /> Mark Topic Completed (+50 XP, +20 Coins)
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: AI FLASHCARDS */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-borderColor/45 pb-3 gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Active Flashcards</h3>
                      <p className="text-xs text-text-muted mt-0.5">Spaced repetition deck covering definitions, syntax, and interview tricks.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={handleShuffleCards} className="flex items-center gap-1">
                        <Shuffle className="h-3.5 w-3.5" /> Shuffle
                      </Button>
                    </div>
                  </div>

                  {loadingFlashcards ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <LoadingSpinner className="h-10 w-10 text-primary mb-2" />
                      <span className="text-xs text-text-muted">Loading flashcard deck...</span>
                    </div>
                  ) : flashcards.length === 0 ? (
                    <div className="text-center py-20 text-xs text-text-muted italic">
                      No flashcards available for this topic.
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto space-y-6">
                      
                      {/* Starred indicator / Diff level indicator */}
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>Card {currentCardIdx + 1} of {flashcards.length}</span>
                        <Badge
                          variant={
                            flashcards[currentCardIdx].difficulty === 'Easy'
                              ? 'success'
                              : flashcards[currentCardIdx].difficulty === 'Hard'
                              ? 'danger'
                              : 'accent'
                          }
                          className="uppercase text-[9px]"
                        >
                          {flashcards[currentCardIdx].difficulty}
                        </Badge>
                      </div>

                      {/* Flashcard Body */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full h-56 cursor-pointer relative preserve-3d transition-transform duration-500 [transform-style:preserve-3d]"
                        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                      >
                        {/* Front Side */}
                        <div className="absolute inset-0 w-full h-full border border-borderColor rounded-2xl bg-card/45 glass shadow-lg flex flex-col items-center justify-center p-6 text-center backface-hidden [backface-visibility:hidden]">
                          <span className="text-[10px] text-primary uppercase font-bold tracking-widest mb-3">Question</span>
                          <p className="font-semibold text-text-primary text-sm leading-relaxed">
                            {flashcards[currentCardIdx].question}
                          </p>
                          <span className="text-[9px] text-text-muted mt-5 animate-pulse">Click card to reveal answer</span>
                        </div>

                        {/* Back Side */}
                        <div
                          className="absolute inset-0 w-full h-full border border-borderColor rounded-2xl bg-card/65 glass shadow-lg flex flex-col items-center justify-center p-6 text-center backface-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]"
                        >
                          <span className="text-[10px] text-accent uppercase font-bold tracking-widest mb-3">Answer</span>
                          <div className="text-xs text-text-primary leading-relaxed font-medium whitespace-pre-line max-h-36 overflow-y-auto">
                            {flashcards[currentCardIdx].answer}
                          </div>
                        </div>
                      </div>

                      {/* Flashcard Action Buttons */}
                      <div className="flex items-center justify-between text-xs px-2 select-none">
                        <button
                          onClick={() => handleStarCard(currentCardIdx)}
                          className={`flex items-center gap-1 font-semibold transition-colors ${
                            favoriteCards.includes(currentCardIdx) ? 'text-amber-400' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <Star className="h-4.5 w-4.5 fill-current" />
                          <span>{favoriteCards.includes(currentCardIdx) ? 'Starred' : 'Favorite'}</span>
                        </button>

                        <div className="flex items-center gap-4">
                          <button
                            disabled={currentCardIdx === 0}
                            onClick={() => {
                              setIsFlipped(false)
                              setCurrentCardIdx(prev => Math.max(0, prev - 1))
                            }}
                            className="p-1.5 bg-surface border border-borderColor hover:bg-card rounded-lg text-text-muted hover:text-text-primary disabled:opacity-50 disabled:pointer-events-none transition-all"
                          >
                            <ChevronLeft className="h-4.5 w-4.5" />
                          </button>
                          <span className="text-text-muted font-mono">{currentCardIdx + 1} / {flashcards.length}</span>
                          <button
                            disabled={currentCardIdx === flashcards.length - 1}
                            onClick={() => {
                              setIsFlipped(false)
                              setCurrentCardIdx(prev => Math.min(flashcards.length - 1, prev + 1))
                            }}
                            className="p-1.5 bg-surface border border-borderColor hover:bg-card rounded-lg text-text-muted hover:text-text-primary disabled:opacity-50 disabled:pointer-events-none transition-all"
                          >
                            <ChevronRight className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDifficultCard(currentCardIdx)}
                          className={`flex items-center gap-1 font-semibold transition-colors ${
                            difficultCards.includes(currentCardIdx) ? 'text-danger' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <AlertCircle className="h-4.5 w-4.5" />
                          <span>{difficultCards.includes(currentCardIdx) ? 'Difficult' : 'Mark Hard'}</span>
                        </button>
                      </div>

                      {/* Spaced Repetition Panel */}
                      <div className="p-3 border border-borderColor rounded-xl bg-surface/40 text-center space-y-2">
                        <span className="text-[10px] text-text-muted block font-semibold uppercase tracking-wider">How well did you recall this?</span>
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="danger" onClick={() => handleSpacedRepetition('Hard')} className="py-1 px-3 text-[10px]">
                            Again (1d)
                          </Button>
                          <Button size="sm" variant="warning" onClick={() => handleSpacedRepetition('Medium')} className="py-1 px-3 text-[10px]">
                            Good (2d)
                          </Button>
                          <Button size="sm" variant="success" onClick={() => handleSpacedRepetition('Easy')} className="py-1 px-3 text-[10px]">
                            Easy (4d)
                          </Button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRACTICE QUIZ */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-borderColor/45 pb-3 gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Practice Quiz</h3>
                      <p className="text-xs text-text-muted mt-0.5">Instant performance check with scoring breakdown & explanations.</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-text-muted">Difficulty:</span>
                        <select
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value)}
                          className="px-2 py-0.5 rounded bg-surface border border-borderColor text-text-primary text-[11px]"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <Button size="sm" variant="secondary" onClick={handleRegenerateQuiz} className="flex items-center gap-1 text-[11px] py-1">
                        <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                      </Button>
                    </div>
                  </div>

                  {loadingQuiz ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <LoadingSpinner className="h-10 w-10 text-primary mb-2" />
                      <span className="text-xs text-text-muted">Compiling questions...</span>
                    </div>
                  ) : quizQuestions.length === 0 ? (
                    <div className="text-center py-20 text-xs text-text-muted italic">
                      Failed to load questions. Reset difficulty and click regenerate.
                    </div>
                  ) : (
                    <form onSubmit={handleQuizSubmit} className="space-y-6 text-xs max-w-xl mx-auto">
                      {quizQuestions.map((q, idx) => (
                        <div key={q.id || idx} className="p-4 border border-borderColor rounded-xl bg-surface/20 space-y-3">
                          <div className="flex items-start justify-between gap-3 border-b border-borderColor/30 pb-2">
                            <span className="font-semibold text-text-primary">Question {idx + 1}</span>
                            <Badge variant="accent" className="text-[9px] uppercase">{q.type}</Badge>
                          </div>
                          
                          <p className="font-semibold text-text-primary leading-relaxed">{q.question}</p>

                          {/* Render options for MCQs */}
                          {q.type === 'mcq' && q.options?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2 pt-1 select-none">
                              {q.options.map((opt) => {
                                const isSelected = userAnswers[q.id] === opt
                                const isCorrect = q.correctAnswer === opt
                                const showSuccess = quizSubmitted && isCorrect
                                const showDanger = quizSubmitted && isSelected && !isCorrect

                                return (
                                  <label
                                    key={opt}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                                      showSuccess
                                        ? 'bg-success/15 border-success text-success font-semibold'
                                        : showDanger
                                        ? 'bg-danger/15 border-danger text-danger font-semibold'
                                        : isSelected
                                        ? 'bg-primary/10 border-primary text-text-primary font-medium'
                                        : 'bg-surface hover:bg-card border-borderColor text-text-muted hover:text-text-primary'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${q.id}`}
                                      value={opt}
                                      checked={isSelected}
                                      disabled={quizSubmitted}
                                      onChange={() => handleQuizAnswer(q.id, opt)}
                                      className="text-primary focus:ring-primary h-3.5 w-3.5 bg-background border-borderColor"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                )
                              })}
                            </div>
                          ) : (
                            // Short/Coding/Numerical textbox input
                            <div className="pt-1">
                              <input
                                type="text"
                                placeholder="Type your answer..."
                                disabled={quizSubmitted}
                                value={userAnswers[q.id] || ''}
                                onChange={(e) => handleQuizAnswer(q.id, e.target.value)}
                                className="w-full px-3 py-2 rounded bg-surface border border-borderColor text-text-primary focus:border-primary text-[11px]"
                              />
                              {quizSubmitted && (
                                <div className="mt-2 text-[11px] flex flex-col gap-1">
                                  <p className="text-success font-semibold">Correct answer key: {q.correctAnswer}</p>
                                  <p className="text-text-muted">Your answer: {userAnswers[q.id] || '(none)'}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Explanation displayed after submission */}
                          {quizSubmitted && q.explanation && (
                            <div className="p-3 bg-surface/50 border border-borderColor/40 rounded-lg text-text-muted text-[11px] leading-relaxed pt-2">
                              <strong className="text-text-primary block mb-0.5">Explanation:</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Submit Button or Scorecard Results */}
                      {!quizSubmitted ? (
                        <Button type="submit" variant="primary" className="w-full py-2.5 font-bold">
                          Submit Answers & Get Score
                        </Button>
                      ) : (
                        <div className="p-4 border border-borderColor rounded-xl bg-card/65 glass space-y-4">
                          <div className="flex items-center justify-between border-b border-borderColor/45 pb-2">
                            <span className="font-bold text-text-primary">Performance Summary</span>
                            <Badge variant={quizScore / quizQuestions.length >= 0.6 ? 'success' : 'danger'}>
                              {Math.round((quizScore / quizQuestions.length) * 100)}% Score
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-surface/50 border border-borderColor rounded-lg">
                              <span className="text-[10px] text-text-muted uppercase">Questions Correct</span>
                              <p className="text-lg font-bold text-text-primary mt-0.5">{quizScore} / {quizQuestions.length}</p>
                            </div>
                            <div className="p-3 bg-surface/50 border border-borderColor rounded-lg">
                              <span className="text-[10px] text-text-muted uppercase">XP Earned</span>
                              <p className="text-lg font-bold text-accent mt-0.5">
                                +{quizScore / quizQuestions.length >= 0.6 ? (quizDifficulty === 'Hard' ? 45 : 35) : 10} XP
                              </p>
                            </div>
                          </div>

                          {quizFeedback && (
                            <div className="text-[11px] space-y-2 leading-relaxed text-text-muted bg-surface/40 p-3 rounded-lg border border-borderColor/20">
                              <p className="text-text-primary font-bold">{quizFeedback.summary}</p>
                              <p><strong>Weak areas:</strong> {quizFeedback.weakAreas}</p>
                              <p><strong>Suggested revision:</strong> {quizFeedback.revisionSuggestion}</p>
                            </div>
                          )}

                          <Button type="button" variant="primary" onClick={handleRegenerateQuiz} className="w-full py-2.5 font-bold">
                            Try Another Quiz
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              )}

              {/* TAB 5: PRACTICE PLATFORMS */}
              {activeTab === 'practice' && (() => {
                const curatedPlats = getPracticePlatforms(learningHub.selectedCategory) || []
                const normalizedTopic = (learningHub.selectedTopic || '').toLowerCase().trim()
                const customPlats = customResources[normalizedTopic] || []
                const allPlats = [
                  ...curatedPlats.map(p => ({ ...p, isCustom: false })),
                  ...customPlats.map(p => ({ ...p, isCustom: true }))
                ]

                return (
                  <div className="space-y-6">
                    <div className="border-b border-borderColor/45 pb-2">
                      <h3 className="text-sm font-bold text-text-primary">Recommended Practice Platforms</h3>
                      <p className="text-xs text-text-muted mt-0.5">Best resources and exercises matching this subject domain. Complete problems to earn XP.</p>
                    </div>

                    {/* Platform suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {allPlats.map((plat, i) => (
                        <div key={i} className="p-4 border border-borderColor rounded-xl bg-surface/30 flex flex-col justify-between gap-3 relative">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5 flex-wrap">
                                {plat.name} 
                                <a href={plat.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 text-text-muted hover:text-primary transition-colors" />
                                </a>
                                {plat.isCustom && (
                                  <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-1 py-0 rounded font-semibold scale-90">
                                    Custom
                                  </span>
                                )}
                              </h4>
                              <p className="text-text-muted text-[11px] leading-relaxed mt-1">{plat.desc}</p>
                            </div>
                            {plat.isCustom && (
                              <button
                                onClick={() => {
                                  removeCustomResource(learningHub.selectedTopic, plat.id)
                                  toast.success('Custom resource removed ✓')
                                }}
                                className="p-1 hover:bg-danger/10 text-text-muted hover:text-danger rounded-lg transition-colors flex-shrink-0"
                                title="Delete Custom Resource"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <a
                            href={plat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline font-bold self-start mt-1"
                          >
                            Visit {plat.name} &rarr;
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Resource Form */}
                    <form onSubmit={handleAddCustomResource} className="p-4 border border-borderColor rounded-xl bg-surface/20 space-y-3">
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5 text-primary" /> Add Custom Practice Platform
                      </h4>
                      <p className="text-[10px] text-text-muted">Link your own preferred coding environments, documentation, or exercises.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-text-muted mb-1 font-medium">Platform Name / Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Codeforces, Frontend Mentor"
                            value={newResourceTitle}
                            onChange={(e) => setNewResourceTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-surface border border-borderColor text-text-primary focus:border-primary text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-text-muted mb-1 font-medium">Platform Link / URL</label>
                          <input
                            type="text"
                            placeholder="e.g. https://codeforces.com"
                            value={newResourceUrl}
                            onChange={(e) => setNewResourceUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-surface border border-borderColor text-text-primary focus:border-primary text-[11px]"
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-auto font-semibold py-1.5 px-4">
                        Add Platform
                      </Button>
                    </form>

                    {/* Progress checklist problems */}
                    <div className="p-4 border border-borderColor rounded-xl bg-surface/20 space-y-3">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Practice Problem Checklist</h3>
                      <p className="text-[10px] text-text-muted">Work on these tasks locally or on platforms. Check them off when complete.</p>
                      
                      <div className="flex flex-col gap-2.5 pt-1 text-xs">
                        {practiceProblems.map((prob, i) => {
                          const isDone = completedProblems[i]
                          return (
                            <label
                              key={i}
                              className={`flex items-center justify-between p-3 rounded-lg border border-borderColor/55 cursor-pointer transition-colors ${
                                isDone ? 'bg-success/5 border-success/30 text-text-muted' : 'bg-surface hover:bg-card text-text-primary'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={!!isDone}
                                  onChange={() => toggleProblemCheck(i, prob.xp)}
                                  className="rounded text-primary focus:ring-primary h-4 w-4 bg-background border-borderColor"
                                />
                                <span className={isDone ? 'line-through text-text-muted' : 'font-medium'}>
                                  {prob.title}
                                </span>
                              </div>
                              <Badge variant="accent" className="text-[9px]">+{prob.xp} XP</Badge>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </>
          )}

        </div>
      </div>
      
    </div>
  )
}
