import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useAI } from '../hooks/useAI'
import { motion } from 'framer-motion'
import {
  Send,
  Plus,
  Settings,
  Sparkles,
  Key,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  User,
  Brain,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../hooks/useToast'
import Badge from '../components/ui/Badge'

// Gorgeous Multi-Agent Execution Trace Visualizer
function AgentTrace({ trace }) {
  const [isOpen, setIsOpen] = useState(false)
  if (!trace || trace.length === 0) return null

  const agentsInvolved = Array.from(new Set(trace.map((t) => t.agent).filter((a) => a && a !== 'System' && a !== 'System Sync')))
  const timelineSteps = trace.filter((t) => t.type !== 'timings')
  const timingsStep = trace.find((t) => t.type === 'timings')

  return (
    <div className="border border-borderColor/40 rounded-xl bg-card/15 p-3.5 max-w-md shadow-lg glass space-y-3 transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-[10px] font-bold text-accent uppercase tracking-wider focus:outline-none"
      >
        <span className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 animate-pulse text-accent" />
          Execution Trace ({agentsInvolved.join(', ') || 'System'})
        </span>
        <span className="text-[9px] text-text-muted hover:text-text-primary transition-colors bg-surface/50 border border-borderColor/20 px-2 py-0.5 rounded">
          {isOpen ? 'Hide Timeline ▲' : 'View Visual Timeline ▼'}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-3 pt-3 border-t border-borderColor/20 max-h-80 overflow-y-auto pr-1">
          {/* Visual Timeline Steps */}
          <div className="flex flex-col gap-1">
            {timelineSteps.map((step, idx) => {
              const agentColors = {
                'Coordinator': 'text-primary bg-primary/10 border-primary/20',
                'Planner Agent': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                'Tutor Agent': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                'Motivation Agent': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                'Resource Agent': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                'System Sync': 'text-success bg-success/10 border-success/20'
              }
              const colorClass = agentColors[step.agent] || 'text-accent bg-accent/10 border-accent/20'

              return (
                <div key={idx} className="flex flex-col items-center w-full">
                  {idx > 0 && (
                    <div className="text-[10px] text-text-muted/60 my-0.5 animate-pulse">↓</div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="w-full p-2.5 rounded-lg bg-surface/20 border border-borderColor/30 flex items-start gap-2.5 shadow-sm hover:border-borderColor/60 transition-colors"
                  >
                    <div className="text-sm p-1.5 rounded bg-surface/40 shadow-inner flex-shrink-0 select-none">
                      {step.icon || "🤖"}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-[10px] text-text-primary">
                          {step.agent}
                        </span>
                        <span className={`px-1 py-0.2 rounded text-[7.5px] font-semibold border ${colorClass}`}>
                          {step.title || 'Step'}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-text-muted leading-relaxed font-mono whitespace-normal break-words">
                        {step.text}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>

          {/* Execution Timings Terminal */}
          {timingsStep && timingsStep.timings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: timelineSteps.length * 0.05 }}
              className="mt-3 p-3 rounded-lg bg-[#0f172a]/95 border border-slate-800 text-[10px] font-mono text-slate-300 shadow-inner"
            >
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wider text-[8px] font-bold">
                <span>Process Step</span>
                <span>Duration</span>
              </div>
              <div className="space-y-1">
                {timingsStep.timings.map((time, tIdx) => {
                  const dotsCount = Math.max(5, 30 - time.label.length)
                  const dots = '.'.repeat(dotsCount)
                  return (
                    <div key={tIdx} className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">{time.label}</span>
                      <span className="text-slate-600 font-light select-none px-1">{dots}</span>
                      <span className="text-accent font-semibold">{time.duration} ms</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center text-emerald-400 border-t border-slate-800 pt-1.5 mt-1.5 font-bold">
                <span>Total Execution Time</span>
                <span className="text-success">{timingsStep.totalDuration} ms</span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AiChiefOfStaff() {
  const {
    chatHistory,
    addChatMessage,
    clearChat,
    addTask,
    addGoal,
    addPlan,
    addCalendarEvent,
    geminiApiKey,
    setGeminiApiKey,
    customApiUrl,
    setCustomApiUrl,
    generateSubGoals
  } = useStore()

  const { sendMessage } = useAI()
  const { toast } = useToast()

  // Chat UI state
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  // Settings Modal state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tempKey, setTempKey] = useState(geminiApiKey)
  const [tempUrl, setTempUrl] = useState(customApiUrl)
  const [showWhyKey, setShowWhyKey] = useState(false)
  const [testStatus, setTestStatus] = useState(null)

  const handleKeyChange = (val) => {
    setTempKey(val)
    setTestStatus(null)
  }

  const handleTestConnection = async () => {
    if (!tempKey) {
      toast.error('Please enter an API key first')
      return
    }
    setTestStatus('testing')
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${tempKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ping' }] }]
        })
      })
      if (response.ok) {
        setTestStatus('success')
        toast.success('Connection successful! ✅')
      } else {
        setTestStatus('error')
        toast.error('Invalid key or connection error ❌')
      }
    } catch (err) {
      setTestStatus('error')
      toast.error('Invalid key or connection error ❌')
    }
  }

  // Modify action states
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editFormData, setEditFormData] = useState(null)

  const messagesEndRef = useRef(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isLoading])

  // Suggested Prompts
  const suggestedPrompts = [
    'Help me crack placements in 6 months',
    'Create a DSA study plan for this week',
    'Schedule my fitness routine',
    'What should I focus on today?'
  ]

  // Handle Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault()
    setGeminiApiKey(tempKey)
    setCustomApiUrl(tempUrl)
    toast.success('AI Settings updated successfully ✓')
    setSettingsOpen(false)
  }

  // Handle Send Message
  const handleSend = async (text) => {
    const messageText = text || inputValue
    if (!messageText.trim() || isLoading) return

    if (!geminiApiKey) {
      toast.error('Please configure your Gemini API Key first')
      setSettingsOpen(true)
      return
    }

    // Add user message
    addChatMessage({
      role: 'user',
      content: messageText
    })

    if (!text) {
      setInputValue('')
    }
    
    setIsLoading(true)

    try {
      const response = await sendMessage(messageText)
      
      // Save assistant message to store
      addChatMessage({
        role: 'assistant',
        content: response.content,
        actions: response.actions ? { ...response.actions, status: 'pending' } : null,
        trace: response.trace || null,
        activeAgents: response.activeAgents || null
      })
    } catch (err) {
      console.error(err)
      let errorMsg = "I'm having trouble connecting. Please try again in a moment."
      
      if (err.message === 'TIMEOUT') {
        errorMsg = "Request timed out. Please check your internet connection or proxy settings."
      } else if (err.message === 'MISSING_API_KEY') {
        errorMsg = "API Key is missing. Please configure it in Settings."
      }

      addChatMessage({
        role: 'assistant',
        content: errorMsg
      })
      toast.error('AI request failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Action: Approve
  const handleApproveAction = (messageId, action) => {
    try {
      const { type, data } = action

      if (type === 'create_task') {
        addTask(data)
      } else if (type === 'create_goal') {
        const goalId = data.id || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        addGoal({ ...data, id: goalId })
        generateSubGoals(goalId)
      } else if (type === 'create_plan') {
        addPlan(data)
      } else if (type === 'schedule_event') {
        addCalendarEvent(data)
      }

      // Update message action status inside Zustand store
      useStore.setState((state) => ({
        chatHistory: state.chatHistory.map((m) =>
          m.id === messageId ? { ...m, actions: { ...m.actions, status: 'approved' } } : m
        )
      }))

      toast.success('Done! Added to your workspace ✓')
    } catch (e) {
      console.error(e)
      toast.error('Failed to apply action')
    }
  }

  // Action: Reject
  const handleRejectAction = (messageId) => {
    useStore.setState((state) => ({
      chatHistory: state.chatHistory.map((m) =>
        m.id === messageId ? { ...m, actions: { ...m.actions, status: 'rejected' } } : m
      )
    }))

    // Add rejection feedback from Assistant
    addChatMessage({
      role: 'assistant',
      content: "Understood, I won't add that. What would you prefer?"
    })
    toast.info('Action rejected')
  }

  // Action: Open Modify Editor
  const handleModifyActionClick = (messageId, action) => {
    setEditingMessageId(messageId)
    setEditFormData({ ...action.data })
  }

  // Action: Save Modify Submission
  const handleSaveModifiedAction = (e) => {
    e.preventDefault()
    const message = chatHistory.find((m) => m.id === editingMessageId)
    if (!message || !message.actions) return

    const { type } = message.actions
    
    // Save to store
    if (type === 'create_task') {
      addTask(editFormData)
    } else if (type === 'create_goal') {
      addGoal(editFormData)
    } else if (type === 'create_plan') {
      addPlan(editFormData)
    } else if (type === 'schedule_event') {
      addCalendarEvent(editFormData)
    }

    // Update message action status in store
    useStore.setState((state) => ({
      chatHistory: state.chatHistory.map((m) =>
        m.id === editingMessageId
          ? { ...m, actions: { ...m.actions, data: { ...editFormData }, status: 'approved' } }
          : m
      )
    }))

    toast.success('Modified action saved to workspace ✓')
    setEditingMessageId(null)
    setEditFormData(null)
  }

  return (
    <div className="flex h-[80vh] border border-borderColor rounded-xl overflow-hidden bg-card/20 glass shadow-card relative">
      
      {/* Sidebar (Conversations / Actions) */}
      <div className="hidden md:flex flex-col w-60 border-r border-borderColor bg-surface/50 p-4">
        
        {/* Sidebar Header: Actions */}
        <button
          onClick={clearChat}
          className="flex items-center justify-center gap-1.5 w-full py-2 bg-primary/15 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-all focus:outline-none mb-6"
        >
          <Plus className="h-4 w-4" /> New Chat
        </button>

        {/* Saved Prompts / Guidelines */}
        <div className="flex-1 space-y-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            Assistant Guide
          </span>
          <p className="text-[10px] text-text-muted leading-relaxed">
            BloomTrack AI OS can directly modify your workspace. Ask it to:
          </p>
          <ul className="text-[10px] text-text-muted list-disc list-inside space-y-1.5 leading-relaxed">
            <li>Plan weekly tasks</li>
            <li>Create semester goals</li>
            <li>Schedule focus timers</li>
            <li>Design learning roadmaps</li>
          </ul>
        </div>

        {/* Settings button */}
        <button
          onClick={() => {
            setTempKey(geminiApiKey)
            setTempUrl(customApiUrl)
            setSettingsOpen(true)}
          }
          className="flex items-center gap-2 py-2 px-3 hover:bg-surface border border-transparent hover:border-borderColor rounded-lg text-text-muted hover:text-text-primary text-xs transition-colors focus:outline-none mt-auto"
        >
          <Settings className="h-4 w-4" />
          <span>Configure API Key</span>
        </button>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-card/5">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-borderColor bg-surface/10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-accent/15 border border-accent/20 rounded text-accent">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">BloomTrack AI OS</h3>
              <p className="text-[9px] text-text-muted">Gemini 2.5 Flash Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 md:hidden text-text-muted hover:text-text-primary rounded hover:bg-surface"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={clearChat}
              className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface"
              title="Clear Conversation"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Message Thread Scroll view */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Missing API Key Warning */}
          {!geminiApiKey && (
            <div className="p-4 border border-warning/30 bg-warning/5 text-warning rounded-xl flex items-start gap-3 max-w-lg mx-auto">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-2">
                <p className="font-bold">Gemini API Key Required</p>
                <p className="text-text-muted leading-relaxed">
                  To interact with Gemini, configure your Gemini API Key. Since the application runs client-side in the browser, your key remains stored inside your local storage and is sent directly to Google Gemini.
                </p>
                <Button onClick={() => setSettingsOpen(true)} variant="glass" size="sm">
                  Configure Settings
                </Button>
              </div>
            </div>
          )}

          {/* Messages list */}
          {chatHistory.map((message) => {
            const isUser = message.role === 'user'
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${
                  isUser ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-accent/10 border-accent/20 text-accent'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                </div>

                {/* Bubble content */}
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surface/50 border border-borderColor rounded-tl-none text-text-primary'
                  }`}>
                    {message.content}
                  </div>

                  {/* Render Agent Trace */}
                  {!isUser && message.trace && (
                    <AgentTrace trace={message.trace} />
                  )}

                  {/* Render Structured Action Approval Card */}
                  {!isUser && message.actions && (
                    <div className="border border-borderColor/60 rounded-xl bg-card glass p-4 space-y-3 max-w-md shadow-sm">
                      <div className="flex items-center justify-between border-b border-borderColor/40 pb-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> Proposed Workspace Update
                        </span>
                        {message.actions.status === 'approved' && (
                          <Badge variant="success">Approved</Badge>
                        )}
                        {message.actions.status === 'rejected' && (
                          <Badge variant="danger">Rejected</Badge>
                        )}
                        {message.actions.status === 'pending' && (
                          <Badge variant="warning">Approval Required</Badge>
                        )}
                      </div>

                      {/* Card Preview Details */}
                      <div className="text-xs text-text-muted space-y-2 bg-surface/40 p-2.5 rounded-lg border border-borderColor/30">
                        {message.actions.type === 'create_task' && (
                          <>
                            <p className="font-bold text-text-primary">Create Task</p>
                            <p><strong>Title:</strong> {message.actions.data.title}</p>
                            {message.actions.data.description && <p><strong>Desc:</strong> {message.actions.data.description}</p>}
                            <p><strong>Category:</strong> {message.actions.data.category || 'Weekly'} • <strong>Priority:</strong> {message.actions.data.priority || 'Medium'}</p>
                            <p><strong>Deadline:</strong> {message.actions.data.deadline}</p>
                          </>
                        )}
                        {message.actions.type === 'create_goal' && (
                          <>
                            <p className="font-bold text-text-primary">Plant Goal</p>
                            <p><strong>Goal Name:</strong> {message.actions.data.title}</p>
                            <p><strong>Category:</strong> {message.actions.data.category} • <strong>Flower:</strong> {message.actions.data.flowerType}</p>
                            <p><strong>Deadline:</strong> {message.actions.data.deadline}</p>
                          </>
                        )}
                        {message.actions.type === 'create_plan' && (
                          <>
                            <p className="font-bold text-text-primary">Create Study Plan</p>
                            <p><strong>Title:</strong> {message.actions.data.title}</p>
                            <p><strong>Tasks proposed:</strong> {message.actions.data.tasks?.length || 0}</p>
                            <p><strong>Milestones:</strong> {message.actions.data.milestones?.length || 0}</p>
                          </>
                        )}
                        {message.actions.type === 'schedule_event' && (
                          <>
                            <p className="font-bold text-text-primary">Schedule Calendar Event</p>
                            <p><strong>Event:</strong> {message.actions.data.title}</p>
                            <p><strong>Time block:</strong> {message.actions.data.date} at {message.actions.data.time} ({message.actions.data.duration}m)</p>
                            <p><strong>Type:</strong> {message.actions.data.type}</p>
                          </>
                        )}
                      </div>

                      {/* Approval Loop Buttons */}
                      {message.actions.status === 'pending' && editingMessageId !== message.id && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveAction(message.id, message.actions)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleModifyActionClick(message.id, message.actions)}
                            className="flex-1"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Modify
                          </Button>
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => handleRejectAction(message.id)}
                            className="text-danger hover:bg-danger/10"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}

                      {/* Inline modification Form */}
                      {editingMessageId === message.id && editFormData && (
                        <form onSubmit={handleSaveModifiedAction} className="space-y-3 pt-2 border-t border-borderColor/30 text-xs">
                          <div>
                            <label className="block font-semibold text-text-primary mb-1">Title</label>
                            <input
                              type="text"
                              value={editFormData.title || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                              className="w-full px-2.5 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                            />
                          </div>

                          {/* Conditional form items */}
                          {message.actions.type === 'create_task' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block font-semibold text-text-primary mb-1">Category</label>
                                <select
                                  value={editFormData.category || 'Daily'}
                                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                  className="w-full px-2 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                                >
                                  <option value="Daily">Daily</option>
                                  <option value="Weekly">Weekly</option>
                                  <option value="Monthly">Monthly</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-semibold text-text-primary mb-1">Priority</label>
                                <select
                                  value={editFormData.priority || 'Medium'}
                                  onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                                  className="w-full px-2 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                                >
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block font-semibold text-text-primary mb-1">Deadline Date</label>
                            <input
                              type="date"
                              value={editFormData.deadline || editFormData.date || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setEditFormData({
                                  ...editFormData,
                                  deadline: val,
                                  date: val
                                })
                              }}
                              className="w-full px-2.5 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 justify-end">
                            <Button variant="secondary" size="sm" onClick={() => setEditingMessageId(null)}>
                              Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm">
                              Confirm & Save
                            </Button>
                          </div>
                        </form>
                      )}

                      {/* Applied / Rejected Inline message feedback */}
                      {message.actions.status === 'approved' && (
                        <p className="text-[10px] text-success font-semibold flex items-center gap-1 mt-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Added to your workspace ✓
                        </p>
                      )}
                      {message.actions.status === 'rejected' && (
                        <p className="text-[10px] text-danger font-semibold flex items-center gap-1 mt-1">
                          <XCircle className="h-3.5 w-3.5" /> Proposed updates rejected
                        </p>
                      )}

                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Assistant typing indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border bg-accent/10 border-accent/20 text-accent">
                <Brain className="h-4 w-4" />
              </div>
              <div className="p-3 bg-surface/50 border border-borderColor rounded-2xl rounded-tl-none flex items-center gap-1 h-8 w-16 justify-center">
                <span className="h-1.5 w-1.5 bg-text-muted rounded-full dot-bounce" />
                <span className="h-1.5 w-1.5 bg-text-muted rounded-full dot-bounce" />
                <span className="h-1.5 w-1.5 bg-text-muted rounded-full dot-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Grid (only shown when chat has no messages except init) */}
        {chatHistory.length <= 1 && !isLoading && (
          <div className="px-4 py-2 grid grid-cols-2 gap-2 max-w-xl mx-auto mb-2 text-xs">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="p-3 border border-borderColor rounded-lg bg-surface/50 hover:bg-primary/5 hover:border-primary/20 text-left text-text-muted hover:text-text-primary transition-all duration-150 focus:outline-none"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Footer Chat Input */}
        <div className="p-4 border-t border-borderColor bg-surface/20">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-end gap-2 max-w-4xl mx-auto"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Command your workspace... (e.g. Schedule my study session)"
              rows="1"
              className="flex-1 px-3.5 py-2.5 border border-borderColor rounded-xl bg-background text-text-primary text-xs placeholder-text-muted focus:outline-none focus:border-primary resize-none max-h-24 min-h-[42px]"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputValue.trim() || isLoading}
              className="rounded-xl h-[42px] px-3.5 flex items-center justify-center"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>
          <p className="text-[10px] text-text-muted text-center mt-2">
            Gemini will respond with actions to plant goals, modify schedules, or build plans.
          </p>
        </div>

      </div>

      {/* Settings Modal (API config) */}
      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="AI Assistant Settings">
        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          
          {/* Step-by-Step Card Guide */}
          <div className="p-3.5 bg-card/60 border border-borderColor rounded-xl space-y-2">
            <span className="font-bold text-text-primary uppercase tracking-wider text-[10px] block mb-1">
              🔑 Gemini API Key Setup Guide
            </span>
            <ul className="space-y-1.5 list-none pl-0 text-text-muted text-[11px]">
              <li className="flex items-start gap-1">
                <span className="font-bold text-accent">1.</span>
                <span>
                  Go to{' '}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold flex inline-flex items-center gap-0.5"
                  >
                    aistudio.google.com <ExternalLink className="h-3.5 w-3.5 inline text-primary" />
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span className="font-bold text-accent">2.</span>
                <span>Sign in with your Google account (free)</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="font-bold text-accent">3.</span>
                <span>Click &quot;Get API key&quot; &rarr; Create API key &rarr; Copy it</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="font-bold text-accent">4.</span>
                <span>Paste it below &mdash; it starts with <code className="bg-surface px-1 py-0.5 rounded text-accent font-mono">AIzaSy...</code></span>
              </li>
            </ul>
          </div>

          {/* Why is this needed Toggle */}
          <div className="border border-borderColor/45 rounded-xl overflow-hidden bg-surface/20">
            <button
              type="button"
              onClick={() => setShowWhyKey(!showWhyKey)}
              className="flex items-center justify-between w-full p-3 font-semibold text-text-primary hover:bg-surface/30 transition-colors focus:outline-none"
            >
              <span>Why is this needed?</span>
              {showWhyKey ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
            </button>
            {showWhyKey && (
              <p className="px-3 pb-3 text-text-muted leading-relaxed text-[11px] border-t border-borderColor/30 pt-2">
                BloomTrack uses Google Gemini AI to generate your study plans, daily tasks, and resource suggestions. Your key is stored locally on your device only.
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1 flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-accent" /> Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="mt-3 flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="py-1 px-3 text-[10px] font-semibold"
              >
                {testStatus === 'testing' ? 'Testing Connection...' : 'Test connection'}
              </Button>
              {testStatus === 'success' && (
                <span className="text-success font-bold flex items-center gap-1 text-[11px]">
                  ✅ Connected
                </span>
              )}
              {testStatus === 'error' && (
                <span className="text-danger font-bold flex items-center gap-1 text-[11px]">
                  ❌ Invalid key
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              API Proxy / Endpoint
            </label>
            <input
              type="text"
              placeholder="https://generativelanguage.googleapis.com"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
            />
            <span className="text-[10px] text-text-muted mt-1 block">
              Defaults to `https://generativelanguage.googleapis.com`. You can customize it if you are routing through a custom proxy.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-borderColor pt-3 mt-4">
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
