import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  Plus,
  Check,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  Target,
  Kanban,
  List,
  Calendar,
  AlertTriangle,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Video,
  Code,
  AlertCircle
} from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useToast } from '../hooks/useToast'

export default function Tasks() {
  const {
    tasks,
    goals,
    plans,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    addGoal,
    approvePlan,
    rejectPlan,
    updateGoal,
    generateSubGoals
  } = useStore()

  const { toast } = useToast()

  // UI state
  const [activeTab, setActiveTab] = useState('Daily') // Daily | Weekly | Monthly | AI Plans | Goals
  const [viewMode, setViewMode] = useState('list') // list | kanban
  
  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  
  // AI Plan Modify modal states
  const [modifyPlanOpen, setModifyPlanOpen] = useState(false)
  const [activePlanToModify, setActivePlanToModify] = useState(null)

  // React Hook Form for Task
  const {
    register: registerTask,
    handleSubmit: handleSubmitTask,
    reset: resetTaskForm,
    setValue: setTaskValue,
    formState: { errors: taskErrors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      category: 'Daily',
      goalId: ''
    }
  })

  // React Hook Form for Goal
  const {
    register: registerGoal,
    handleSubmit: handleSubmitGoal,
    control: goalControl,
    reset: resetGoalForm,
    formState: { errors: goalErrors },
    watch: watchGoal,
    setValue: setGoalValue
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Learning',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      flowerType: 'Lavender',
      description: '',
      hoursPerWeek: 10,
      timePeriod: '1 month',
      customDeadline: new Date().toISOString().split('T')[0],
      milestones: [{ title: '' }]
    }
  })

  const watchedTimePeriod = watchGoal('timePeriod') || '1 month'
  const watchedCustomDeadline = watchGoal('customDeadline') || ''
  const watchedGoalDeadline = watchGoal('deadline') || ''
  const watchedFlowerType = watchGoal('flowerType') || 'Lavender'

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
      return customDate || new Date().toISOString().split('T')[0];
    }
    return today.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (watchedTimePeriod === 'Custom date') {
      setGoalValue('deadline', watchedCustomDeadline)
    } else {
      setGoalValue('deadline', calculateDeadlineDate(watchedTimePeriod))
    }
  }, [watchedTimePeriod, watchedCustomDeadline, setGoalValue])

  // Goal Form field array for milestones
  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone
  } = useFieldArray({
    control: goalControl,
    name: 'milestones'
  })

  // React Hook Form for modifying AI plan tasks
  const {
    register: registerModPlan,
    handleSubmit: handleSubmitModPlan,
    control: modPlanControl,
    reset: resetModPlanForm
  } = useForm()

  const { fields: modPlanTaskFields } = useFieldArray({
    control: modPlanControl,
    name: 'tasks'
  })

  // Filters tasks based on tab selection
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'Goals' || activeTab === 'AI Plans') return false
    return task.category === activeTab
  })

  // Open Edit Task Modal
  const handleEditTaskClick = (task) => {
    setEditingTask(task)
    setTaskValue('title', task.title)
    setTaskValue('description', task.description)
    setTaskValue('deadline', task.deadline)
    setTaskValue('priority', task.priority)
    setTaskValue('category', task.category)
    setTaskValue('goalId', task.goalId)
    setTaskModalOpen(true)
  }

  // Handle Task Submit (Create or Edit)
  const onTaskSubmit = (data) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
      toast.success('Task updated successfully ✓')
    } else {
      addTask(data)
      toast.success('Task created successfully ✓')
    }
    closeTaskModal()
  }

  const closeTaskModal = () => {
    setTaskModalOpen(false)
    setEditingTask(null)
    resetTaskForm()
  }

  // Handle Goal Submit
  const onGoalSubmit = (data) => {
    const milestonesFiltered = data.milestones
      .filter((m) => m.title.trim() !== '')
      .map((m) => ({ title: m.title, completed: false }))

    const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    addGoal({
      ...data,
      id: goalId,
      milestones: milestonesFiltered,
      progress: 0,
      hoursPerWeek: Number(data.hoursPerWeek)
    })

    toast.success('New goal planted! Flower added to garden 🌸')
    setGoalModalOpen(false)
    resetGoalForm()

    // Trigger sub-goal generation
    generateSubGoals(goalId)
  }

  // Handle Plan Modification Submission
  const onModifyPlanSubmit = (data) => {
    if (!activePlanToModify) return
    
    const goalId = `goal-${Date.now()}`
    
    // Create goal
    addGoal({
      title: activePlanToModify.title,
      category: 'Learning',
      deadline: activePlanToModify.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      flowerType: 'Lavender',
      progress: 0,
      milestones: activePlanToModify.milestones.map((m) => ({ title: m.title, completed: false }))
    })

    // Create custom tasks
    data.tasks.forEach((t) => {
      addTask({
        title: t.title,
        description: t.description || '',
        deadline: t.deadline || new Date().toISOString().split('T')[0],
        priority: t.priority || 'Medium',
        goalId: goalId,
        category: t.category || 'Weekly',
        status: 'To Do'
      })
    })

    // Mark plan as approved
    updateGoal(goalId, { title: activePlanToModify.title })
    useStore.setState((state) => ({
      plans: state.plans.map((p) => p.id === activePlanToModify.id ? { ...p, status: 'approved' } : p)
    }))

    toast.success('AI plan modified and approved successfully ✓')
    setModifyPlanOpen(false)
    setActivePlanToModify(null)
  }

  // Handle Kanban Drag & Drop
  const handleOnDragEnd = (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    
    // Map Droppable Column IDs to status
    // Columns: "todo-col", "inprogress-col", "done-col"
    const statusMap = {
      'todo-col': 'To Do',
      'inprogress-col': 'In Progress',
      'done-col': 'Done'
    }

    const newStatus = statusMap[destination.droppableId]
    if (newStatus) {
      setTaskStatus(draggableId, newStatus)
      toast.success(`Task status updated to ${newStatus} ✓`)
    }
  }

  // Helper to parse numeric target from title/description
  const parseNumericTarget = (task) => {
    const regex = /\b(\d+)\s+([a-zA-Z]{3,})\b/i
    const titleMatch = task.title.match(regex)
    if (titleMatch) {
      return {
        total: parseInt(titleMatch[1], 10),
        noun: titleMatch[2]
      }
    }
    const descMatch = task.description?.match(regex)
    if (descMatch) {
      return {
        total: parseInt(descMatch[1], 10),
        noun: descMatch[2]
      }
    }
    return null
  }

  // Handle sub-task progress count updates
  const handleUpdateSubProgress = (task, newCount, total) => {
    const clampedCount = Math.max(0, newCount)
    const isDone = clampedCount >= total
    
    updateTask(task.id, {
      completedCount: clampedCount,
      status: isDone ? 'Done' : (task.status === 'Done' ? 'To Do' : task.status)
    })
    
    if (isDone && task.status !== 'Done') {
      toast.success(`Task completed! Numeric goal of ${total} reached ✓`)
    }
  }

  // Toggle Completed Task
  const toggleCompleteTask = (task) => {
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done'
    const target = parseNumericTarget(task)
    const updates = { status: nextStatus }
    
    if (target) {
      updates.completedCount = nextStatus === 'Done' ? target.total : 0
    }
    
    updateTask(task.id, updates)
    toast.success(nextStatus === 'Done' ? 'Task completed! ✓' : 'Task reopened ✓')
  }

  // Toggle Completed Goal
  const toggleCompleteGoal = (goal) => {
    const nextCompleted = !goal.completed
    updateGoal(goal.id, {
      completed: nextCompleted,
      progress: nextCompleted ? 100 : 0
    })
    toast.success(nextCompleted ? 'Goal achieved! 🌸' : 'Goal reopened')
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-borderColor/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks Workspace</h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your daily milestones, Kanban status boards, and AI-proposed plans.
          </p>
        </div>
        
        {/* Top right actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {activeTab !== 'Goals' && activeTab !== 'AI Plans' && (
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
              className="p-2 border border-borderColor rounded-lg bg-surface hover:bg-card text-text-muted hover:text-text-primary transition-all text-xs flex items-center gap-1.5 focus:outline-none"
              title="Toggle list/Kanban view"
            >
              {viewMode === 'list' ? <Kanban className="h-4 w-4" /> : <List className="h-4 w-4" />}
              <span className="hidden sm:inline">{viewMode === 'list' ? 'Kanban Board' : 'List View'}</span>
            </button>
          )}
          {activeTab === 'Goals' ? (
            <Button onClick={() => setGoalModalOpen(true)} className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Plant Goal
            </Button>
          ) : (
            <Button onClick={() => setTaskModalOpen(true)} className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Tabs list Bar */}
      <div className="flex items-center gap-1 border-b border-borderColor/50 overflow-x-auto pb-0.5 scrollbar-none">
        {['Daily', 'Weekly', 'Monthly', 'AI Plans', 'Goals'].map((tab) => {
          const isSelected = activeTab === tab
          
          // Calculate counts
          let count = 0
          if (tab === 'Daily' || tab === 'Weekly' || tab === 'Monthly') {
            count = tasks.filter((t) => t.category === tab).length
          } else if (tab === 'AI Plans') {
            count = plans.filter((p) => p.status === 'pending').length
          } else if (tab === 'Goals') {
            count = goals.length
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 whitespace-nowrap focus:outline-none flex items-center gap-2 ${
                isSelected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold border transition-colors ${
                isSelected 
                  ? 'bg-primary/20 border-primary/30 text-primary' 
                  : 'bg-surface border-borderColor text-text-muted hover:text-text-primary'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Page Content area */}
      <div className="mt-4">
        
        {/* TABS 1: Tasks (Daily, Weekly, Monthly) */}
        {activeTab !== 'Goals' && activeTab !== 'AI Plans' && (
          <>
            {filteredTasks.length === 0 ? (
              <EmptyState
                title={`No ${activeTab} Tasks`}
                description={`You don't have any tasks scheduled under the ${activeTab} category. Click below to schedule one.`}
                icon={FolderOpen}
                actionText="Schedule New Task"
                onActionClick={() => setTaskModalOpen(true)}
              />
            ) : viewMode === 'list' ? (
              
              // Standard LIST view
              <div className="space-y-6">
                {/* Active Tasks List */}
                {filteredTasks.filter((t) => t.status !== 'Done').length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTasks
                      .filter((t) => t.status !== 'Done')
                      .map((task) => {
                        const linkedGoal = goals.find((g) => g.id === task.goalId)
                        return (
                          <motion.div
                            key={task.id}
                            whileHover={{ y: -2 }}
                            className="p-4 border border-borderColor rounded-xl bg-card/45 glass shadow-card flex items-start gap-3 transition-all"
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleCompleteTask(task)}
                              className="mt-1 flex-shrink-0 w-4 h-4 rounded border border-borderColor hover:border-primary bg-surface flex items-center justify-center transition-colors focus:outline-none"
                              title="Mark as Done"
                            >
                              <span className="sr-only">Mark as Done</span>
                            </button>

                            <div className="flex-1 min-w-0">
                              {/* Title & Priority */}
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <h4 className="text-sm font-semibold text-text-primary truncate">
                                  {task.title}
                                </h4>
                                <Badge
                                  variant={
                                    task.priority === 'High'
                                      ? 'danger'
                                      : task.priority === 'Medium'
                                      ? 'warning'
                                      : 'success'
                                  }
                                >
                                  {task.priority}
                                </Badge>
                                {linkedGoal && <Badge variant="accent">{linkedGoal.title}</Badge>}
                              </div>

                              {/* Description */}
                              {task.description && (
                                <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* Deadline */}
                              <span className="text-[10px] text-text-muted flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Due: {task.deadline}
                              </span>

                              {/* Sub-task Progress Tracker */}
                              {(() => {
                                const target = parseNumericTarget(task)
                                if (!target) return null
                                const currentCount = task.completedCount || 0
                                const progressPercent = Math.min(100, Math.round((currentCount / target.total) * 100))
                                return (
                                  <div className="mt-3 p-2.5 rounded-lg bg-surface/60 border border-borderColor/40 flex flex-col gap-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                                        Progress ({target.noun})
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSubProgress(task, currentCount - 1, target.total)}
                                          className="w-5 h-5 rounded bg-surface border border-borderColor flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors text-xs font-bold"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          value={currentCount}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value, 10)
                                            handleUpdateSubProgress(task, isNaN(val) ? 0 : val, target.total)
                                          }}
                                          className="w-10 text-center py-0.5 px-1 bg-background border border-borderColor rounded text-xs text-text-primary focus:outline-none focus:border-primary"
                                          min="0"
                                          max={target.total}
                                        />
                                        <span className="text-[10px] text-text-muted font-medium">/ {target.total}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSubProgress(task, currentCount + 1, target.total)}
                                          className="w-5 h-5 rounded bg-surface border border-borderColor flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors text-xs font-bold"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    <div className="w-full bg-background border border-borderColor/40 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-accent h-full rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })()}
                              <TaskResources taskId={task.id} taskTitle={task.title} />
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditTaskClick(task)}
                                className="p-1.5 rounded-lg border border-borderColor bg-surface hover:bg-card text-text-muted hover:text-text-primary transition-colors"
                                title="Edit Task"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  deleteTask(task.id)
                                  toast.success('Task removed ✓')
                                }}
                                className="p-1.5 rounded-lg border border-borderColor bg-surface hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                  </div>
                )}

                {/* Completed Tasks List */}
                {filteredTasks.filter((t) => t.status === 'Done').length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-borderColor/40 pb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Completed Tasks</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 border border-success/20 text-success font-semibold">
                        {filteredTasks.filter((t) => t.status === 'Done').length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTasks
                        .filter((t) => t.status === 'Done')
                        .map((task) => {
                          const linkedGoal = goals.find((g) => g.id === task.goalId)
                          return (
                            <motion.div
                              key={task.id}
                              whileHover={{ y: -2 }}
                              className="p-4 border border-borderColor/45 rounded-xl bg-card/25 glass shadow-card flex items-start gap-3 transition-all opacity-70"
                            >
                              {/* Checkbox Checked */}
                              <button
                                onClick={() => toggleCompleteTask(task)}
                                className="mt-1 flex-shrink-0 w-4 h-4 rounded border bg-success border-success text-white flex items-center justify-center transition-colors focus:outline-none"
                                title="Mark as Active"
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </button>

                              <div className="flex-1 min-w-0">
                                {/* Title & Priority */}
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <h4 className="text-sm font-semibold text-text-muted line-through truncate">
                                    {task.title}
                                  </h4>
                                  <Badge variant="success">Complete</Badge>
                                  <Badge
                                    variant={
                                      task.priority === 'High'
                                        ? 'danger'
                                        : task.priority === 'Medium'
                                        ? 'warning'
                                        : 'success'
                                    }
                                  >
                                    {task.priority}
                                  </Badge>
                                  {linkedGoal && <Badge variant="accent">{linkedGoal.title}</Badge>}
                                </div>

                                {/* Description */}
                                {task.description && (
                                  <p className="text-xs text-text-muted/75 line-clamp-2 mb-3 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Deadline */}
                                <span className="text-[10px] text-text-muted/75 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> Due: {task.deadline}
                                </span>

                                {/* Sub-task Progress Tracker */}
                                {(() => {
                                  const target = parseNumericTarget(task)
                                  if (!target) return null
                                  const currentCount = task.completedCount || 0
                                  const progressPercent = Math.min(100, Math.round((currentCount / target.total) * 100))
                                  return (
                                    <div className="mt-3 p-2.5 rounded-lg bg-surface/40 border border-borderColor/30 flex flex-col gap-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider">
                                          Progress ({target.noun})
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateSubProgress(task, currentCount - 1, target.total)}
                                            className="w-5 h-5 rounded bg-surface border border-borderColor/40 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors text-xs font-bold"
                                          >
                                            -
                                          </button>
                                          <input
                                            type="number"
                                            value={currentCount}
                                            onChange={(e) => {
                                              const val = parseInt(e.target.value, 10)
                                              handleUpdateSubProgress(task, isNaN(val) ? 0 : val, target.total)
                                            }}
                                            className="w-10 text-center py-0.5 px-1 bg-background border border-borderColor/40 rounded text-xs text-text-primary focus:outline-none focus:border-primary"
                                            min="0"
                                            max={target.total}
                                          />
                                          <span className="text-[10px] text-text-muted/70 font-medium">/ {target.total}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateSubProgress(task, currentCount + 1, target.total)}
                                            className="w-5 h-5 rounded bg-surface border border-borderColor/40 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors text-xs font-bold"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div className="w-full bg-background border border-borderColor/30 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-accent/70 h-full rounded-full transition-all duration-300"
                                          style={{ width: `${progressPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  )
                                })()}
                                <TaskResources taskId={task.id} taskTitle={task.title} />
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleEditTaskClick(task)}
                                  className="p-1.5 rounded-lg border border-borderColor/40 bg-surface/50 hover:bg-card text-text-muted hover:text-text-primary transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    deleteTask(task.id)
                                    toast.success('Task removed ✓')
                                  }}
                                  className="p-1.5 rounded-lg border border-borderColor/40 bg-surface/50 hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              
              // KANBAN board view
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Columns */}
                  {['To Do', 'In Progress', 'Done'].map((colTitle) => {
                    const colId =
                      colTitle === 'To Do'
                        ? 'todo-col'
                        : colTitle === 'In Progress'
                        ? 'inprogress-col'
                        : 'done-col'
                    
                    const colTasks = filteredTasks.filter((t) => t.status === colTitle)

                    return (
                      <div key={colId} className="flex flex-col h-[500px] border border-borderColor/60 bg-surface/20 rounded-xl glass p-3 select-none">
                        <div className="flex items-center justify-between px-2 pb-2 mb-3 border-b border-borderColor/40">
                          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            {colTitle}
                          </span>
                          <span className="text-[10px] font-bold text-text-muted bg-surface border border-borderColor px-2 py-0.5 rounded-full">
                            {colTasks.length}
                          </span>
                        </div>

                        <Droppable droppableId={colId}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="flex-1 overflow-y-auto space-y-2.5 pr-0.5"
                            >
                              {colTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(dragProvided) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className={`p-3 border rounded-lg bg-card/85 glass shadow-sm hover:border-primary/20 transition-all flex flex-col gap-2 ${
                                        task.status === 'Done' ? 'border-borderColor/40 opacity-70' : 'border-borderColor'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <button
                                          onClick={() => toggleCompleteTask(task)}
                                          className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors focus:outline-none ${
                                            task.status === 'Done'
                                              ? 'bg-success border-success text-white'
                                              : 'border-borderColor hover:border-primary bg-surface'
                                          }`}
                                        >
                                          {task.status === 'Done' && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                        </button>
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-xs font-semibold text-text-primary line-clamp-1 ${
                                              task.status === 'Done' ? 'line-through text-text-muted' : ''
                                            }`}>
                                              {task.title}
                                            </span>
                                            {task.status === 'Done' && <Badge variant="success">Complete</Badge>}
                                          </div>
                                          {task.description && (
                                            <p className="text-[10px] text-text-muted mt-1 line-clamp-2">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Sub-task Progress Tracker in Kanban */}
                                      {(() => {
                                        const target = parseNumericTarget(task)
                                        if (!target) return null
                                        const currentCount = task.completedCount || 0
                                        const progressPercent = Math.min(100, Math.round((currentCount / target.total) * 100))
                                        return (
                                          <div className="p-1.5 rounded bg-surface/50 border border-borderColor/30 flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between gap-1 text-[9px]">
                                              <span className="text-text-muted">{target.noun}</span>
                                              <div className="flex items-center gap-0.5">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUpdateSubProgress(task, currentCount - 1, target.total)
                                                  }}
                                                  className="w-4 h-4 rounded bg-surface border border-borderColor flex items-center justify-center text-text-muted hover:text-text-primary"
                                                >
                                                  -
                                                </button>
                                                <span className="text-text-primary px-1 font-semibold">{currentCount}/{target.total}</span>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUpdateSubProgress(task, currentCount + 1, target.total)
                                                  }}
                                                  className="w-4 h-4 rounded bg-surface border border-borderColor flex items-center justify-center text-text-muted hover:text-text-primary"
                                                >
                                                  +
                                                </button>
                                              </div>
                                            </div>
                                            <div className="w-full bg-background h-1 rounded-full overflow-hidden">
                                              <div className="bg-accent h-full animate-all" style={{ width: `${progressPercent}%` }} />
                                            </div>
                                          </div>
                                        )
                                      })()}
                                      <TaskResources taskId={task.id} taskTitle={task.title} />

                                      <div className="flex items-center justify-between border-t border-borderColor/30 pt-2 text-[9px] text-text-muted">
                                        <span>Due: {task.deadline}</span>
                                        <Badge
                                          variant={
                                            task.priority === 'High'
                                              ? 'danger'
                                              : task.priority === 'Medium'
                                              ? 'warning'
                                              : 'success'
                                          }
                                        >
                                          {task.priority}
                                        </Badge>
                                      </div>

                                      {/* Mobile Helper buttons */}
                                      <div className="flex items-center justify-end gap-1 border-t border-borderColor/20 pt-1.5 mt-1 sm:hidden">
                                        {colTitle !== 'To Do' && (
                                          <button
                                            onClick={() => setTaskStatus(task.id, colTitle === 'Done' ? 'In Progress' : 'To Do')}
                                            className="text-[9px] text-primary px-1.5 py-0.5 border border-primary/20 rounded"
                                          >
                                            &larr; Move
                                          </button>
                                        )}
                                        {colTitle !== 'Done' && (
                                          <button
                                            onClick={() => setTaskStatus(task.id, colTitle === 'To Do' ? 'In Progress' : 'Done')}
                                            className="text-[9px] text-accent px-1.5 py-0.5 border border-accent/20 rounded"
                                          >
                                            Move &rarr;
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )
                  })}
                </div>
              </DragDropContext>
            )}
          </>
        )}

        {/* TABS 2: AI Generated Plans */}
        {activeTab === 'AI Plans' && (
          <div className="space-y-6">
            {plans.filter((p) => p.status === 'pending').length === 0 ? (
              <EmptyState
                title="No Pending Plans"
                description="Your assistant hasn't proposed any study plans recently. Go to BloomTrack AI OS to generate one."
                icon={Sparkles}
                actionText="Talk to BloomTrack AI OS"
                onActionClick={() => {
                  window.location.href = '/ai'
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans
                  .filter((p) => p.status === 'pending')
                  .map((plan) => (
                    <motion.div
                      key={plan.id}
                      className="p-5 border border-borderColor rounded-xl bg-card/30 glass shadow-card flex flex-col justify-between"
                    >
                      <div>
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-success/15 border border-success/20 rounded text-success">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <h4 className="text-sm font-bold text-text-primary">{plan.title}</h4>
                        </div>

                        {/* Roadmap summary */}
                        <div className="mb-4">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                            Roadmap Highlights
                          </span>
                          <ul className="list-disc list-inside text-xs text-text-muted mt-1.5 space-y-1">
                            {plan.roadmap.slice(0, 3).map((r, i) => (
                              <li key={i} className="line-clamp-1">{r}</li>
                            ))}
                            {plan.roadmap.length > 3 && <li className="italic text-[10px]">+{plan.roadmap.length - 3} more steps</li>}
                          </ul>
                        </div>

                        {/* Tasks preview */}
                        <div className="mb-6">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                            Proposed Tasks ({plan.tasks.length})
                          </span>
                          <div className="flex flex-col gap-1.5 mt-1.5 max-h-36 overflow-y-auto pr-0.5">
                            {plan.tasks.slice(0, 3).map((t, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-surface/50 border border-borderColor/45 rounded text-xs">
                                <span className="font-medium text-text-primary line-clamp-1">{t.title}</span>
                                <Badge variant="secondary">{t.priority || 'Medium'}</Badge>
                              </div>
                            ))}
                            {plan.tasks.length > 3 && (
                              <p className="text-[10px] text-text-muted italic text-right">
                                + {plan.tasks.length - 3} more tasks
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-borderColor/40">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            approvePlan(plan.id)
                            toast.success('Plan approved! Added goals and tasks to workspace ✓')
                          }}
                          className="flex-1"
                        >
                          Approve Plan
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Populate modification form
                            setActivePlanToModify(plan)
                            resetModPlanForm({
                              tasks: plan.tasks.map((t) => ({
                                title: t.title,
                                description: t.description || '',
                                deadline: t.deadline || new Date().toISOString().split('T')[0],
                                priority: t.priority || 'Medium',
                                category: t.category || 'Weekly'
                              }))
                            })
                            setModifyPlanOpen(true)
                          }}
                          className="flex-1"
                        >
                          Modify
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            rejectPlan(plan.id)
                            toast.error('Plan rejected')
                          }}
                        >
                          Reject
                        </Button>
                      </div>

                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TABS 3: Goals sub-section */}
        {activeTab === 'Goals' && (
          <div className="space-y-6">
            {goals.length === 0 ? (
              <EmptyState
                title="No goals planted"
                description="Plant your goals to grow custom digital flowers in your garden."
                icon={Target}
                actionText="Plant Goal"
                onActionClick={() => setGoalModalOpen(true)}
              />
            ) : (
              <div className="space-y-6">
                {/* Active Goals */}
                {goals.filter((g) => !g.completed).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals
                      .filter((g) => !g.completed)
                      .map((goal) => (
                        <div
                          key={goal.id}
                          className="p-5 border border-borderColor rounded-xl bg-card/30 glass shadow-card flex flex-col justify-between transition-all animate-all"
                        >
                          <div>
                            {/* Name, Checkbox & Badge */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <button
                                  onClick={() => toggleCompleteGoal(goal)}
                                  className="mt-1 flex-shrink-0 w-4 h-4 rounded border border-borderColor hover:border-primary bg-surface flex items-center justify-center transition-colors focus:outline-none"
                                  title="Mark as Done"
                                >
                                  <span className="sr-only">Mark as Done</span>
                                </button>
                                <h4 className="text-sm font-bold text-text-primary truncate max-w-[200px]" title={goal.title}>
                                  {goal.title}
                                </h4>
                              </div>
                              <Badge variant="accent">{goal.category}</Badge>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              {goal.generationStatus === 'generating' ? (
                                <div className="mt-3 flex items-center gap-2 p-2 bg-surface/50 rounded border border-borderColor text-text-muted">
                                  <LoadingSpinner size="sm" className="h-4 w-4" />
                                  <span className="text-[10px] animate-pulse">Generating your study plan...</span>
                                </div>
                              ) : goal.generationStatus === 'failed' ? (
                                <div className="mt-3 flex items-center justify-between gap-2 p-2 bg-danger/5 border border-danger/25 rounded text-text-muted">
                                  <span className="text-[10px]">Plan generation failed</span>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      generateSubGoals(goal.id)
                                    }}
                                    className="py-0.5 px-2 text-[9px] font-bold"
                                  >
                                    Generate plan
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-text-muted">Goal Progress</span>
                                    <span className="font-bold text-primary">{goal.progress}%</span>
                                  </div>
                                  <div className="w-full bg-surface border border-borderColor h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-primary h-full rounded-full animate-all"
                                      style={{ width: `${goal.progress}%` }}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Milestones count */}
                            <div className="flex items-center justify-between text-xs text-text-muted">
                              <span>Milestones: {goal.milestones?.filter((m) => m.completed).length || 0}/{goal.milestones?.length || 0}</span>
                              <span>Due: {goal.deadline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Completed Goals */}
                {goals.filter((g) => g.completed).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-borderColor/40 pb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Completed Goals</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 border border-success/20 text-success font-semibold">
                        {goals.filter((g) => g.completed).length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goals
                        .filter((g) => g.completed)
                        .map((goal) => (
                          <div
                            key={goal.id}
                            className="p-5 border border-borderColor/45 rounded-xl bg-card/25 glass shadow-card flex flex-col justify-between transition-all opacity-70"
                          >
                            <div>
                              {/* Name, Checkbox & Badge */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-start gap-2 min-w-0">
                                  <button
                                    onClick={() => toggleCompleteGoal(goal)}
                                    className="mt-1 flex-shrink-0 w-4 h-4 rounded border bg-success border-success text-white flex items-center justify-center transition-colors focus:outline-none"
                                    title="Mark as Active"
                                  >
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  </button>
                                  <h4 className="text-sm font-bold text-text-muted line-through truncate max-w-[200px]" title={goal.title}>
                                    {goal.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="success">Complete</Badge>
                                  <Badge variant="accent">{goal.category}</Badge>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-text-muted">Goal Progress</span>
                                  <span className="font-bold text-success">{goal.progress}%</span>
                                </div>
                                <div className="w-full bg-surface border border-borderColor h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-success h-full rounded-full animate-all"
                                    style={{ width: `${goal.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Milestones count */}
                              <div className="flex items-center justify-between text-xs text-text-muted">
                                <span>Milestones: {goal.milestones?.filter((m) => m.completed).length || 0}/{goal.milestones?.length || 0}</span>
                                <span>Due: {goal.deadline}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal A: Add/Edit Task */}
      <Modal
        isOpen={taskModalOpen}
        onClose={closeTaskModal}
        title={editingTask ? 'Edit Study Task' : 'Add New Study Task'}
      >
        <form onSubmit={handleSubmitTask(onTaskSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">Task Title*</label>
            <input
              type="text"
              placeholder="e.g. Complete math assignment"
              {...registerTask('title', { required: true })}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
            />
            {taskErrors.title && (
              <span className="text-danger text-[10px] mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Title is required
              </span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">Description</label>
            <textarea
              placeholder="Describe targets, resources, etc."
              rows="3"
              {...registerTask('description')}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Category</label>
              <select
                {...registerTask('category')}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Priority</label>
              <select
                {...registerTask('priority')}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Deadline Date*</label>
              <input
                type="date"
                {...registerTask('deadline', { required: true })}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Link to Goal</label>
              <select
                {...registerTask('goalId')}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-borderColor pt-3 mt-4">
            <Button variant="secondary" onClick={closeTaskModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal B: Add Goal */}
      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} title="Plant New Goal">
        <form onSubmit={handleSubmitGoal(onGoalSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">Goal Name*</label>
            <input
              type="text"
              placeholder="e.g. Final Semester Placement Preparation"
              {...registerGoal('title', { required: true })}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
            />
            {goalErrors.title && (
              <span className="text-danger text-[10px] mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Goal Title is required
              </span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1.5">Plant Species*</label>
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
                const isSelected = watchedFlowerType === species.name;
                return (
                  <button
                    key={species.name}
                    type="button"
                    onClick={() => setGoalValue('flowerType', species.name)}
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
              <label className="block font-semibold text-text-primary mb-1">Category</label>
              <select
                {...registerGoal('category')}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none"
              >
                <option value="Learning">Learning</option>
                <option value="Career">Career</option>
                <option value="Fitness">Fitness</option>
                <option value="Project">Project</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Hours/Week</label>
              <input
                type="number"
                min="1"
                max="168"
                {...registerGoal('hoursPerWeek', { required: true, min: 1 })}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">Time Period*</label>
            <select
              {...registerGoal('timePeriod')}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none"
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

          {watchedTimePeriod === 'Custom date' && (
            <div>
              <label className="block font-semibold text-text-primary mb-1">Custom Deadline Date*</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...registerGoal('customDeadline')}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none"
              />
            </div>
          )}

          <div className="p-2.5 bg-surface/50 border border-borderColor rounded-lg">
            <span className="text-[10px] text-text-muted">
              Target Date: <strong className="text-primary">{watchedGoalDeadline}</strong>
            </span>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">Description</label>
            <textarea
              placeholder="Detail targets, roadmap, motivations..."
              rows="3"
              {...registerGoal('description')}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none resize-none"
            />
          </div>

          {/* Milestones list */}
          <div>
            <label className="block font-semibold text-text-primary mb-1.5 flex items-center justify-between">
              <span>Goal Milestones</span>
              <button
                type="button"
                onClick={() => appendMilestone({ title: '' })}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                + Add Milestone
              </button>
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {milestoneFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Milestone #${index + 1}`}
                    {...registerGoal(`milestones.${index}.title`)}
                    className="flex-1 px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none"
                  />
                  {milestoneFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="p-2 border border-borderColor rounded hover:bg-danger/10 hover:text-danger transition-all text-text-muted"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-borderColor pt-3 mt-4">
            <Button variant="secondary" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Sprout Botanical Goal Seed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal C: Modify AI Plan */}
      <Modal isOpen={modifyPlanOpen} onClose={() => setModifyPlanOpen(false)} title="Modify Proposed AI Plan">
        {activePlanToModify && (
          <form onSubmit={handleSubmitModPlan(onModifyPlanSubmit)} className="space-y-4 text-xs">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mb-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                Plan Target
              </span>
              <p className="font-semibold text-text-primary text-sm">{activePlanToModify.title}</p>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1.5">
                Edit Proposed Tasks ({modPlanTaskFields.length})
              </label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {modPlanTaskFields.map((field, index) => (
                  <div key={field.id} className="p-3 border border-borderColor rounded-lg bg-surface/50 space-y-2">
                    <div>
                      <label className="block font-medium text-text-muted mb-0.5">Task Title</label>
                      <input
                        type="text"
                        {...registerModPlan(`tasks.${index}.title`)}
                        className="w-full px-2.5 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-text-muted mb-0.5">Category</label>
                        <select
                          {...registerModPlan(`tasks.${index}.category`)}
                          className="w-full px-2 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-text-muted mb-0.5">Priority</label>
                        <select
                          {...registerModPlan(`tasks.${index}.priority`)}
                          className="w-full px-2 py-1.5 border border-borderColor rounded bg-background text-text-primary"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-borderColor pt-3 mt-4">
              <Button variant="secondary" onClick={() => setModifyPlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Approve Modified Plan
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  )
}

function TaskResources({ taskId, taskTitle }) {
  const [expanded, setExpanded] = useState(false)
  const [resources, setResources] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { geminiApiKey } = useStore()

  useEffect(() => {
    if (!expanded) return

    const cacheKey = `bloomtrack_resources_${taskId}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        setResources(JSON.parse(cached))
        return
      } catch (e) {
        console.error('Failed to parse cached resources', e)
      }
    }

    fetchResources()
  }, [expanded, taskId])

  const fetchResources = async () => {
    setIsLoading(true)
    setError(null)

    if (!geminiApiKey) {
      setError('Gemini API Key is missing. Configure it in settings first.')
      setIsLoading(false)
      return
    }

    try {
      const prompt = `For the task '${taskTitle}', suggest: (1) 2-3 LeetCode/GFG/HackerRank problems with direct URLs, (2) 1-2 best YouTube videos with search URLs, (3) 1 best article/docs link. Return JSON: { "problems": [{"title": "...", "url": "...", "platform": "...", "difficulty": "EASY"|"MEDIUM"|"HARD"}], "videos": [{"title": "...", "url": "..."}], "articles": [{"title": "...", "url": "..."}] }`

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!response.ok) {
        throw new Error('API_ERROR')
      }

      const responseData = await response.json()
      let text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || ''
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim()

      const startJsonIdx = text.indexOf('{')
      const endJsonIdx = text.lastIndexOf('}')
      if (startJsonIdx !== -1 && endJsonIdx !== -1 && endJsonIdx > startJsonIdx) {
        text = text.substring(startJsonIdx, endJsonIdx + 1)
      }

      const data = JSON.parse(text)
      setResources(data)
      localStorage.setItem(`bloomtrack_resources_${taskId}`, JSON.stringify(data))
    } catch (err) {
      console.error(err)
      setError('Failed to load resource suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (diff) => {
    const d = diff?.toUpperCase() || ''
    if (d === 'EASY') return 'bg-success/15 border-success/20 text-success'
    if (d === 'MEDIUM') return 'bg-warning/15 border-warning/20 text-warning'
    if (d === 'HARD') return 'bg-danger/15 border-danger/20 text-danger'
    return 'bg-primary/15 border-primary/20 text-primary'
  }

  const getPlatformColor = (plat) => {
    const p = plat?.toLowerCase() || ''
    if (p.includes('leetcode')) return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    if (p.includes('gfg') || p.includes('geeksforgeeks')) return 'bg-green-600/10 border-green-600/20 text-green-600'
    if (p.includes('hackerrank')) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
  }

  return (
    <div className="mt-3 border-t border-borderColor/30 pt-2 text-xs">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
        className="flex items-center justify-between w-full text-text-muted hover:text-text-primary transition-colors py-1.5 focus:outline-none"
      >
        <span className="flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5 text-accent" /> Smart Resources
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="mt-2.5 space-y-3.5 bg-surface/30 p-2.5 rounded-lg border border-borderColor/25">
          {isLoading && (
            <div className="space-y-2 py-1 animate-pulse">
              <div className="h-3.5 bg-white/[0.05] rounded w-3/4 animate-pulse"></div>
              <div className="h-3.5 bg-white/[0.05] rounded w-5/6 animate-pulse"></div>
              <div className="h-3.5 bg-white/[0.05] rounded w-2/3 animate-pulse"></div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center p-2 text-center text-text-muted text-[10px]">
              <AlertCircle className="h-5 w-5 text-danger mb-1" />
              <span>{error}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fetchResources(); }}
                className="mt-2 text-primary hover:underline font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && resources && (
            <>
              {/* Coding Problems */}
              {resources.problems && resources.problems.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Code className="h-3 w-3" /> Practice Problems
                  </div>
                  <div className="flex flex-col gap-1">
                    {resources.problems.map((prob, idx) => (
                      <a
                        key={idx}
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded bg-surface hover:bg-card border border-borderColor/40 transition-colors group cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[9px] px-1 py-0.5 rounded border font-semibold ${getDifficultyColor(prob.difficulty)}`}>
                            {prob.difficulty || 'MEDIUM'}
                          </span>
                          <span className="text-text-primary font-medium truncate group-hover:text-primary transition-colors text-[11px]">
                            {prob.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${getPlatformColor(prob.platform)}`}>
                            {prob.platform || 'LeetCode'}
                          </span>
                          <ExternalLink className="h-3 w-3 text-text-muted group-hover:text-text-primary" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Videos */}
              {resources.videos && resources.videos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Video className="h-3 w-3" /> Video Tutorials
                  </div>
                  <div className="flex flex-col gap-1">
                    {resources.videos.map((vid, idx) => (
                      <a
                        key={idx}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded bg-surface hover:bg-card border border-borderColor/40 transition-colors group cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-text-primary font-medium truncate group-hover:text-primary transition-colors text-[11px] truncate max-w-[200px]">
                          {vid.title}
                        </span>
                        <ExternalLink className="h-3 w-3 text-text-muted group-hover:text-text-primary flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles / Docs */}
              {resources.articles && resources.articles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Documentation & Articles
                  </div>
                  <div className="flex flex-col gap-1">
                    {resources.articles.map((art, idx) => (
                      <a
                        key={idx}
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded bg-surface hover:bg-card border border-borderColor/40 transition-colors group cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-text-primary font-medium truncate group-hover:text-primary transition-colors text-[11px] truncate max-w-[200px]">
                          {art.title}
                        </span>
                        <ExternalLink className="h-3 w-3 text-text-muted group-hover:text-text-primary flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

