import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flower2, Sparkles, CheckSquare, Calendar, ShieldCheck, ArrowRight, ArrowDown } from 'lucide-react'
import Button from '../components/ui/Button'

export default function HowItWorks() {
  const growthStages = [
    { percent: '0%', label: 'Seed', desc: 'Planted in soil, representing a brand new goal.' },
    { percent: '10%', label: 'Sprout', desc: 'A tiny green shoot appears, showing initial intent.' },
    { percent: '25%', label: 'Small Plant', desc: 'First leaves emerge as you begin taking action.' },
    { percent: '50%', label: 'Bud Forming', desc: 'Goal is halfway completed; flower is taking shape.' },
    { percent: '75%', label: 'Nearly Bloomed', desc: 'Almost there! The flower structure is prominent.' },
    { percent: '100%', label: 'Full Bloom', desc: 'Goal accomplished! A burst celebration occurs.' },
    { percent: 'Wilt', label: 'Wilting', desc: 'Faded petals and droop if tasks are overdue.' }
  ]

  const workflowSteps = [
    {
      title: 'Prompt BloomTrack AI OS',
      desc: 'Ask the assistant to build study roadmaps, plan workouts, or schedules (e.g., "Create a DSA preparation schedule for this week").',
      icon: <Sparkles className="h-5 w-5 text-primary" />
    },
    {
      title: 'AI Proposes Structured Action Block',
      desc: 'Claude generates a clear, natural explanation followed by an approval card displaying the proposed tasks, deadlines, and milestones.',
      icon: <CheckSquare className="h-5 w-5 text-accent" />
    },
    {
      title: 'Review & Edit Proposed Actions',
      desc: 'You can approve the actions directly, modify the tasks, or reject them. The AI adapts to your choices.',
      icon: <ShieldCheck className="h-5 w-5 text-warning" />
    },
    {
      title: 'Auto-Sync to Workspace & Garden',
      desc: 'Once approved, the goals are planted, tasks are linked, and events populate your calendar immediately.',
      icon: <Flower2 className="h-5 w-5 text-success" />
    }
  ]

  return (
    <div className="py-6 max-w-5xl mx-auto px-4">
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          How BloomTrack OS Works
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
          Learn how we merge digital gardening, task systems, and AI planning into one cohesive workspace.
        </p>
      </div>

      {/* Section 1: What is BloomTrack OS */}
      <section className="mb-20">
        <h2 className="text-xl sm:text-2xl font-semibold mb-8 text-center text-text-primary flex items-center justify-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" /> 1. Core Ecosystem Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-borderColor rounded-xl bg-card/30 glass">
            <h3 className="text-base font-semibold text-text-primary mb-2">Task-to-Goal Linking</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Every task can be linked to a parent goal. Completing these linked tasks is what drives the goal progress forward and grows your flower.
            </p>
          </div>
          <div className="p-6 border border-borderColor rounded-xl bg-card/30 glass">
            <h3 className="text-base font-semibold text-text-primary mb-2">Automated Calendar Sync</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Any task with a due date is automatically rendered as a calendar pill. Rescheduling is as simple as dragging it to a new day.
            </p>
          </div>
          <div className="p-6 border border-borderColor rounded-xl bg-card/30 glass">
            <h3 className="text-base font-semibold text-text-primary mb-2">Focus Pomodoro logs</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Work with the customizable Pomodoro timer. Every session is tracked under your weekly focus stats to map out high-productivity hours.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: How Flowers Grow */}
      <section className="mb-20">
        <h2 className="text-xl sm:text-2xl font-semibold mb-8 text-center text-text-primary flex items-center justify-center gap-2">
          <Flower2 className="h-6 w-6 text-success" /> 2. Digital Garden Growth Stages
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {growthStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-xl flex flex-col items-center text-center glass ${
                stage.label === 'Wilting'
                  ? 'border-danger/30 bg-danger/5 text-danger'
                  : 'border-borderColor bg-card/30 text-text-primary'
              }`}
            >
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface border border-borderColor mb-3">
                {stage.percent}
              </span>
              <p className="text-xs font-semibold mb-1">{stage.label}</p>
              <p className="text-[10px] text-text-muted leading-relaxed mt-auto">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: AI Agent Workflow */}
      <section className="mb-20">
        <h2 className="text-xl sm:text-2xl font-semibold mb-12 text-center text-text-primary flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" /> 3. AI Agent Action Workflow
        </h2>
        <div className="flex flex-col items-center max-w-lg mx-auto">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="w-full flex flex-col items-center">
              <div className="w-full flex items-start gap-4 p-5 border border-borderColor rounded-xl bg-card/30 glass relative">
                <div className="p-3 bg-surface border border-borderColor rounded-lg">
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    Step {idx + 1}: {step.title}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
              {idx < workflowSteps.length - 1 && (
                <div className="my-4 text-text-muted flex justify-center">
                  <ArrowDown className="h-5 w-5 animate-bounce" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Get Started */}
      <section className="text-center bg-card/30 glass border border-borderColor p-8 sm:p-12 rounded-2xl flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Grow Your Garden?</h2>
        <p className="text-xs text-text-muted mb-8 max-w-sm leading-relaxed">
          Open your dashboard workspace to plant your first goal, start study sessions, or command the AI Assistant.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" className="group">
            Launch Your Workspace
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </section>

    </div>
  )
}
