import { useState } from 'react'
import { useStore } from '../store/useStore'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  startOfToday
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Bookmark,
  Trash2,
  FolderOpen
} from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../hooks/useToast'

export default function Calendar() {
  const {
    calendarEvents,
    tasks,
    goals,
    addCalendarEvent,
    deleteCalendarEvent,
    updateTask,
    useStoreState
  } = useStore()

  const { toast } = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('Month') // Month | Week | Agenda
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState('')

  // Form states for Add Event
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('12:00')
  const [eventDuration, setEventDuration] = useState('60')
  const [eventType, setEventType] = useState('Other') // Task | Goal | Focus | Other
  const [linkedId, setLinkedId] = useState('')
  const [formError, setFormError] = useState('')

  // Sync tasks as calendar events automatically
  const allEvents = [
    ...calendarEvents.map((e) => ({ ...e, isTask: false })),
    ...tasks
      .filter((t) => t.deadline)
      .map((t) => ({
        id: t.id,
        title: `Task: ${t.title}`,
        date: t.deadline,
        time: '09:00',
        duration: '30',
        type: 'Task',
        linkedId: t.goalId,
        isTask: true,
        status: t.status
      }))
  ]

  // Month navigation
  const nextPeriod = () => {
    if (view === 'Month') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'Week') setCurrentDate(addDays(currentDate, 7))
    else setCurrentDate(addDays(currentDate, 14))
  }

  const prevPeriod = () => {
    if (view === 'Month') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'Week') setCurrentDate(subDays(currentDate, 7))
    else setCurrentDate(subDays(currentDate, 14))
  }

  // Generate days for Month grid view
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  // Generate days for Week view
  const getWeekDays = () => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }

  // Reschedule drag and drop logic
  const handleDragStart = (e, id, isTask) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, isTask }))
  }

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault()
    try {
      const dataStr = e.dataTransfer.getData('text/plain')
      if (!dataStr) return
      
      const { id, isTask } = JSON.parse(dataStr)

      if (isTask) {
        // Dragging a task updates its deadline
        updateTask(id, { deadline: targetDateStr })
        toast.success(`Task rescheduled to ${targetDateStr} ✓`)
      } else {
        // Dragging an event updates its date
        useStore.setState((state) => ({
          calendarEvents: state.calendarEvents.map((evt) =>
            evt.id === id ? { ...evt, date: targetDateStr } : evt
          )
        }))
        toast.success(`Event rescheduled to ${targetDateStr} ✓`)
      }
    } catch (err) {
      console.error('Drag drop error:', err)
    }
  }

  // Handle click to open modal
  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    setSelectedDateStr(dateStr)
    setAddEventOpen(true)
  }

  // Add Event Form Submission
  const handleAddEventSubmit = (e) => {
    e.preventDefault()
    if (!eventTitle.trim()) {
      setFormError('Event Title is required')
      return
    }

    addCalendarEvent({
      title: eventTitle,
      date: selectedDateStr,
      time: eventTime,
      duration: eventDuration,
      type: eventType,
      linkedId
    })

    toast.success('Event scheduled successfully ✓')
    
    // Reset Form
    setEventTitle('')
    setEventTime('12:00')
    setEventDuration('60')
    setEventType('Other')
    setLinkedId('')
    setFormError('')
    setAddEventOpen(false)
  }

  const handleDeleteEvent = (id) => {
    deleteCalendarEvent(id)
    toast.success('Event deleted ✓')
  }

  // Event Colors mapping
  const eventColors = {
    Task: 'bg-primary/15 border-primary/30 text-primary',
    Goal: 'bg-accent/15 border-accent/30 text-accent',
    Focus: 'bg-success/15 border-success/30 text-success',
    Other: 'bg-surface border-borderColor text-text-muted'
  }

  const monthDays = getMonthDays()
  const weekDays = getWeekDays()

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderColor/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Calendar Workspace</h1>
          <p className="text-xs text-text-muted mt-1">
            Reschedule events using drag-and-drop. Task deadlines sync automatically.
          </p>
        </div>
        
        {/* Switchers */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className="flex bg-surface border border-borderColor rounded-lg p-0.5 text-xs">
            {['Month', 'Week', 'Agenda'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all focus:outline-none ${
                  view === v
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              setSelectedDateStr(format(new Date(), 'yyyy-MM-dd'))
              setAddEventOpen(true)
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </div>

      {/* Navigation Row */}
      <div className="flex items-center justify-between bg-card/25 border border-borderColor/60 glass p-3.5 rounded-xl">
        <h2 className="text-base font-bold text-text-primary">
          {view === 'Month'
            ? format(currentDate, 'MMMM yyyy')
            : view === 'Week'
            ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
            : 'Upcoming Agenda'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="p-1.5 border border-borderColor rounded-lg hover:bg-surface text-text-muted hover:text-text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs border border-borderColor rounded-lg hover:bg-surface text-text-primary font-medium"
          >
            Today
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 border border-borderColor rounded-lg hover:bg-surface text-text-muted hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CALENDAR BODY */}
      <div className="mt-4">
        
        {/* VIEW 1: Month View Grid */}
        {view === 'Month' && (
          <div className="border border-borderColor/80 bg-card/10 glass rounded-xl overflow-hidden shadow-card">
            
            {/* Days of week titles */}
            <div className="grid grid-cols-7 border-b border-borderColor text-center py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 grid-rows-5 h-[520px] divide-x divide-y divide-borderColor/50">
              {monthDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const dayEvents = allEvents.filter((e) => e.date === dateStr)

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    className={`p-1.5 flex flex-col justify-between overflow-hidden cursor-pointer hover:bg-surface/30 transition-colors select-none ${
                      !isCurrentMonth ? 'opacity-30' : ''
                    } ${isToday ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    {/* Day number header */}
                    <span className={`text-[10px] font-bold block w-fit p-1 rounded-md ${
                      isToday ? 'bg-primary text-white' : 'text-text-muted'
                    }`}>
                      {format(day, 'd')}
                    </span>

                    {/* Events List container */}
                    <div className="flex-1 mt-1 overflow-y-auto space-y-1 scrollbar-none pr-0.5">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, evt.id, evt.isTask)}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!evt.isTask) {
                              handleDeleteEvent(evt.id)
                            } else {
                              toast.info(`Go to Tasks page to edit "${evt.title}"`)
                            }
                          }}
                          className={`px-2 py-0.5 text-[9px] font-semibold border rounded truncate cursor-move flex items-center justify-between group transition-all ${
                            eventColors[evt.type] || eventColors.Other
                          } ${evt.status === 'Done' ? 'opacity-40 line-through' : ''}`}
                          title={`${evt.title} (${evt.time}) - Click to Delete Event`}
                        >
                          <span className="truncate">{evt.title}</span>
                          {!evt.isTask && (
                            <span className="opacity-0 group-hover:opacity-100 text-danger font-bold text-[8px]">x</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* VIEW 2: Weekly columns View */}
        {view === 'Week' && (
          <div className="grid grid-cols-7 border border-borderColor rounded-xl overflow-hidden bg-card/10 glass shadow-card divide-x divide-borderColor/60 h-[480px]">
            {weekDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isToday = isSameDay(day, new Date())
              const dayEvents = allEvents.filter((e) => e.date === dateStr)

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={`flex flex-col p-2.5 cursor-pointer hover:bg-surface/30 transition-colors relative ${
                    isToday ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Day header */}
                  <div className="text-center border-b border-borderColor/40 pb-2 mb-3">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-sm font-bold inline-block px-2 py-0.5 rounded-full mt-1 ${
                      isToday ? 'bg-primary text-white' : 'text-text-primary'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Day Events list column */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-none">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, evt.id, evt.isTask)}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!evt.isTask) {
                            handleDeleteEvent(evt.id)
                          }
                        }}
                        className={`p-2 border rounded-lg text-[10px] font-semibold flex flex-col gap-1 transition-all cursor-move ${
                          eventColors[evt.type] || eventColors.Other
                        } ${evt.status === 'Done' ? 'opacity-40 line-through' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold line-clamp-2 leading-tight">{evt.title}</span>
                          {!evt.isTask && (
                            <span className="text-[8px] text-danger hover:underline">Delete</span>
                          )}
                        </div>
                        <span className="text-[8px] text-text-muted flex items-center gap-0.5 mt-auto">
                          <Clock className="h-2.5 w-2.5" strokeWidth="3" /> {evt.time} ({evt.duration}m)
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* VIEW 3: Agenda timeline View */}
        {view === 'Agenda' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {allEvents.length === 0 ? (
              <EmptyState
                title="Agenda is clear"
                description="No upcoming events scheduled. Double click a calendar grid or click above to schedule an event."
                icon={FolderOpen}
                actionText="Schedule New Event"
                onActionClick={() => {
                  setSelectedDateStr(format(new Date(), 'yyyy-MM-dd'))
                  setAddEventOpen(true)
                }}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {allEvents
                  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 border border-borderColor rounded-xl bg-card/30 glass flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 border rounded-lg ${eventColors[evt.type] || eventColors.Other}`}>
                          <CalendarIcon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-text-primary">{evt.title}</h4>
                          <div className="flex items-center gap-3 text-[10px] text-text-muted mt-1.5 flex-wrap">
                            <span>Date: <strong>{evt.date}</strong></span>
                            <span>Time: <strong>{evt.time}</strong></span>
                            <span>Duration: <strong>{evt.duration} min</strong></span>
                            <span>Type: <strong className="uppercase">{evt.type}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      {!evt.isTask ? (
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-2 border border-borderColor rounded-lg bg-surface hover:bg-danger/10 hover:text-danger text-text-muted transition-colors focus:outline-none"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-text-muted font-medium bg-surface border border-borderColor px-2 py-0.5 rounded">
                          Synced Task
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add Event Modal */}
      <Modal isOpen={addEventOpen} onClose={() => setAddEventOpen(false)} title={`Schedule Event on ${selectedDateStr}`}>
        <form onSubmit={handleAddEventSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-2.5 bg-danger/10 border border-danger/25 text-danger rounded font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-text-primary mb-1">Event Title*</label>
            <input
              type="text"
              placeholder="e.g. Placement Prep Revision"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Date</label>
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-primary mb-1">Start Time</label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Duration (minutes)</label>
              <select
                value={eventDuration}
                onChange={(e) => setEventDuration(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min (1h)</option>
                <option value="90">90 min</option>
                <option value="120">120 min (2h)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-text-primary mb-1">Category Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded bg-background text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Other">Other</option>
                <option value="Task">Task</option>
                <option value="Goal">Goal</option>
                <option value="Focus">Focus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">Link to Goal (Optional)</label>
            <select
              value={linkedId}
              onChange={(e) => setLinkedId(e.target.value)}
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

          <div className="flex items-center justify-end gap-2 border-t border-borderColor pt-3 mt-4">
            <Button variant="secondary" onClick={() => setAddEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
