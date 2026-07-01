import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Target, Plus, CheckCircle, Clock, Trash2, Award, ChevronRight, AlertTriangle } from 'lucide-react'
import FlowerSVG from './FlowerSVG'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useToast } from '../../hooks/useToast'

export default function FlowerGarden() {
  const {
    goals,
    tasks,
    updateGoal,
    deleteGoal,
    updateTask,
    generateSubGoals
  } = useStore()

  const { toast } = useToast()
  
  const [selectedGoalId, setSelectedGoalId] = useState(null)
  const [particles, setParticles] = useState([])
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [goalToDeleteId, setGoalToDeleteId] = useState(null)

   const selectedGoal = goals.find((g) => g.id === selectedGoalId)
  const goalTasks = tasks.filter((t) => t.goalId === selectedGoalId)

  // Determine if a goal is wilting
  // Wilting: has uncompleted tasks where the deadline is before today
  const isGoalWilted = (goalId) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const linkedTasks = tasks.filter((t) => t.goalId === goalId)
    return linkedTasks.some((t) => t.status !== 'Done' && t.deadline < todayStr)
  }

  // Trigger bloom celebration particles
  const triggerBloomCelebration = () => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: `p-${Date.now()}-${i}`,
      x: Math.random() * 80 - 40, // center offset
      y: Math.random() * 80 - 40,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.2
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1600)
    toast.success("🌸 Spectacular bloom celebration!")
  }

  // Auto-detect when a goal newly reaches 100% progress to trigger bloom celebration
  const prevProgressRef = useRef({})
  useEffect(() => {
    goals.forEach((goal) => {
      const prev = prevProgressRef.current[goal.id]
      if (prev !== undefined && prev < 100 && goal.progress >= 100) {
        triggerBloomCelebration()
      }
      prevProgressRef.current[goal.id] = goal.progress
    })
  }, [goals])

  // Handle milestone checkbox toggle
  const toggleMilestone = (idx) => {
    if (!selectedGoal) return
    const updatedMilestones = selectedGoal.milestones.map((m, i) =>
      i === idx ? { ...m, completed: !m.completed } : m
    )
    
    // Auto-calculate progress based on completed milestones
    const completedCount = updatedMilestones.filter((m) => m.completed).length
    const totalCount = updatedMilestones.length
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : selectedGoal.progress

    updateGoal(selectedGoal.id, {
      milestones: updatedMilestones,
      progress: newProgress
    })

    if (newProgress === 100 && selectedGoal.progress < 100) {
      triggerBloomCelebration()
    } else {
      toast.success("Milestone updated ✓")
    }
  }

  // Open modal for selected goal
  const handleOpenGoal = (id) => {
    setSelectedGoalId(id)
  }

  const handleDeleteGoal = (id) => {
    deleteGoal(id)
    setSelectedGoalId(null)
    toast.success("Goal removed from garden ✓")
  }

  return (
    <div className="w-full">
      {goals.length === 0 ? (
        <EmptyState
          title="Grow Your Garden"
          description="Your garden is empty. Plant a new goal, set milestones, and complete tasks to grow your flowers."
          icon={Target}
          actionText="Plant Your First Goal"
          onActionClick={() => {
            // We can dispatch a custom event or let page level trigger modal
            const event = new CustomEvent('open-add-goal-modal')
            window.dispatchEvent(event)
          }}
        />
      ) : (
        <div className="relative">
          {/* Horizontal Scroll Garden Row */}
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-thin whitespace-nowrap snap-x">
            {goals.map((goal) => {
              const wilted = isGoalWilted(goal.id)
              const isFullBloom = goal.progress >= 100

              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => handleOpenGoal(goal.id)}
                  className={`flex-shrink-0 w-52 snap-start border border-borderColor rounded-xl bg-card p-4 glass shadow-card cursor-pointer relative transition-all duration-200 select-none ${
                    wilted ? 'border-danger/20 hover:border-danger/40' : 'hover:border-primary/30'
                  }`}
                >
                  {/* Wilt / Bloom Alert Overlay */}
                  <div className="absolute top-2.5 right-2.5">
                    {wilted ? (
                      <Badge variant="danger">Wilting</Badge>
                    ) : isFullBloom ? (
                      <Badge variant="success">Bloomed</Badge>
                    ) : (
                      <Badge variant="accent">{goal.progress}%</Badge>
                    )}
                  </div>

                  {/* SVG Container */}
                  <div className="w-full h-44 flex items-center justify-center mb-3">
                    {goal.generationStatus === 'generating' ? (
                      <div className="flex flex-col items-center justify-center text-center p-3">
                        <LoadingSpinner size="sm" className="h-8 w-8 text-primary animate-spin mb-3" />
                        <span className="text-[11px] text-text-muted font-medium animate-pulse whitespace-normal">
                          Generating your study plan...
                        </span>
                      </div>
                    ) : goal.generationStatus === 'failed' ? (
                      <div className="flex flex-col items-center justify-center text-center p-3 gap-2">
                        <AlertTriangle className="h-8 w-8 text-danger mb-1 animate-pulse" />
                        <span className="text-[11px] text-text-muted font-medium whitespace-normal">
                          Plan generation failed
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation() // prevent opening detail modal
                            generateSubGoals(goal.id)
                          }}
                          className="py-1 px-2.5 text-[10px] font-bold"
                        >
                          Generate plan
                        </Button>
                      </div>
                    ) : (
                      <FlowerSVG type={goal.flowerType} progress={goal.progress} isWilted={wilted} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center overflow-hidden">
                    <h4 className="text-sm font-semibold text-text-primary truncate" title={goal.title}>
                      {goal.title}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">
                      {goal.category}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <p className="text-[10px] text-text-muted italic mt-2 text-center md:text-left">
            * Tips: Click any flower to view milestones, linked tasks, or update progress.
          </p>
        </div>
      )}

      {/* Goal Detail Modal */}
      <Modal
        isOpen={selectedGoalId !== null}
        onClose={() => setSelectedGoalId(null)}
        title={selectedGoal ? selectedGoal.title : 'Goal Details'}
        className="max-w-md relative overflow-hidden"
      >
        {selectedGoal && (
          <div className="space-y-6">
            
            {/* Particle Celebration Container */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 0, x: p.x, y: p.y }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: p.delay }}
                  className="absolute rounded-full bg-accent"
                  style={{ width: p.size, height: p.size }}
                />
              ))}
            </div>

            {/* Goal Stats Banner */}
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-surface border border-borderColor text-xs">
              <div>
                <span className="text-text-muted">Category</span>
                <p className="font-semibold text-text-primary uppercase tracking-wider mt-0.5">
                  {selectedGoal.category}
                </p>
              </div>
              <div>
                <span className="text-text-muted">Deadline</span>
                <p className="font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  {selectedGoal.deadline}
                </p>
              </div>
            </div>

            {/* Flower Type & Progress Info */}
            <div className="flex items-center gap-4 p-3 bg-card rounded-lg border border-borderColor">
              <div className="w-16 h-16 bg-surface rounded-md border border-borderColor p-1 flex items-center justify-center">
                <FlowerSVG
                  type={selectedGoal.flowerType}
                  progress={selectedGoal.progress}
                  isWilted={isGoalWilted(selectedGoal.id)}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-muted font-medium">Growth Progress</span>
                  <span className="font-bold text-accent">{selectedGoal.progress}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-borderColor">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedGoal.progress}%` }}
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                  />
                </div>
                {selectedGoal.progress >= 100 && (
                  <button
                    onClick={triggerBloomCelebration}
                    className="text-[10px] text-accent hover:underline font-semibold mt-1 flex items-center gap-0.5"
                  >
                    <Award className="h-3 w-3" /> Trigger Bloom Sparks
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedGoal.description && (
              <div>
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                  Description
                </h4>
                <p className="text-xs text-text-muted leading-relaxed p-3 bg-surface rounded-lg border border-borderColor">
                  {selectedGoal.description}
                </p>
              </div>
            )}

            {/* Milestones Checklist */}
            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Milestones</span>
                <span className="text-[10px] text-text-muted">Grow by checking milestones</span>
              </h4>
              {selectedGoal.milestones?.length === 0 ? (
                <p className="text-xs text-text-muted italic bg-surface/50 p-3 rounded-lg border border-borderColor">
                  No milestones defined. Edit the goal to add milestones.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {selectedGoal.milestones.map((m, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-borderColor bg-surface hover:bg-card cursor-pointer transition-colors text-xs text-text-primary select-none"
                    >
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => toggleMilestone(idx)}
                        className="rounded text-primary focus:ring-primary h-4 w-4 bg-background border-borderColor"
                      />
                      <span className={m.completed ? 'line-through text-text-muted' : ''}>
                        {m.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Workspace Tasks */}
            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">
                Linked Tasks ({goalTasks.length})
              </h4>
              {goalTasks.length === 0 ? (
                <p className="text-xs text-text-muted italic bg-surface/50 p-3 rounded-lg border border-borderColor">
                  No tasks currently linked to this goal.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {goalTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-borderColor bg-surface text-xs"
                    >
                      <span className={t.status === 'Done' ? 'line-through text-text-muted' : 'font-medium'}>
                        {t.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-text-muted bg-card px-2 py-0.5 rounded border border-borderColor">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-borderColor pt-4 mt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setGoalToDeleteId(selectedGoal.id)
                  setIsConfirmDeleteOpen(true)
                }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Goal
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedGoalId(null)}
              >
                Close details
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Confirm Goal Deletion"
        className="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-primary leading-relaxed font-semibold">
            ⚠️ Warning: This action is permanent!
          </p>
          <p className="text-text-muted leading-relaxed">
            Deleting this goal will also permanently delete:
          </p>
          <ul className="list-disc list-inside text-text-muted pl-1 space-y-1.5 font-medium">
            <li>All associated milestones and sub-tasks.</li>
            <li>All daily, weekly, or monthly tasks linked to this goal.</li>
            <li>All calendar events and timed focus sessions referencing this goal or its tasks.</li>
          </ul>
          <p className="text-text-muted leading-relaxed font-medium">
            Are you sure you want to proceed?
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderColor">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (goalToDeleteId) {
                  handleDeleteGoal(goalToDeleteId)
                  setIsConfirmDeleteOpen(false)
                }
              }}
            >
              Yes, Delete Goal & Tasks
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
