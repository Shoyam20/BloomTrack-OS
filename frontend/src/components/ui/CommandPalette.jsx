import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckSquare, Target, Calendar, Sparkles, X, Clock } from 'lucide-react'

export default function CommandPalette() {
  const { searchOpen, setSearchOpen, tasks, goals, calendarEvents, plans } = useStore()
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bloomtrack-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [searchOpen])

  // Save query to recent searches
  const saveRecentSearch = (text) => {
    if (!text.trim()) return
    const filtered = [text, ...recentSearches.filter((s) => s !== text)].slice(0, 5)
    setRecentSearches(filtered)
    localStorage.setItem('bloomtrack-recent-searches', JSON.stringify(filtered))
  }

  // Keyboard shortcut listener (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, setSearchOpen])

  // Focus input when palette opens
  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus()
      }, 50)
    }
  }, [searchOpen])

  // Simple fuzzy matching
  const searchResults = []
  if (query.trim().length > 0) {
    const lowerQuery = query.toLowerCase()

    // 1. Match Goals
    goals.forEach((goal) => {
      if (goal.title.toLowerCase().includes(lowerQuery) || goal.category.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: goal.id,
          title: goal.title,
          subtitle: `Goal • ${goal.category} (${goal.progress}% progress)`,
          type: 'goal',
          path: '/dashboard',
          icon: <Target className="h-4 w-4 text-accent" />
        })
      }
    })

    // 2. Match Tasks
    tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(lowerQuery) || (task.description && task.description.toLowerCase().includes(lowerQuery))) {
        searchResults.push({
          id: task.id,
          title: task.title,
          subtitle: `Task • Priority ${task.priority} • Status: ${task.status}`,
          type: 'task',
          path: '/tasks',
          icon: <CheckSquare className="h-4 w-4 text-primary" />
        })
      }
    })

    // 3. Match Events
    calendarEvents.forEach((ev) => {
      if (ev.title.toLowerCase().includes(lowerQuery) || ev.type.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: ev.id,
          title: ev.title,
          subtitle: `Event • ${ev.date} ${ev.time} (${ev.duration}m)`,
          type: 'event',
          path: '/calendar',
          icon: <Calendar className="h-4 w-4 text-warning" />
        })
      }
    })

    // 4. Match Plans
    plans.forEach((plan) => {
      if (plan.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: plan.id,
          title: plan.title,
          subtitle: `AI Plan • Status: ${plan.status}`,
          type: 'plan',
          path: '/tasks',
          icon: <Sparkles className="h-4 w-4 text-success" />
        })
      }
    })
  }

  // Keyboard navigation through search results
  useEffect(() => {
    const handleNav = (e) => {
      if (!searchOpen || searchResults.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % searchResults.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect(searchResults[selectedIndex])
      }
    }
    window.addEventListener('keydown', handleNav)
    return () => window.removeEventListener('keydown', handleNav)
  }, [searchOpen, searchResults, selectedIndex])

  const handleSelect = (item) => {
    saveRecentSearch(query)
    setSearchOpen(false)
    navigate(item.path)
  }

  const handleRecentClick = (text) => {
    setQuery(text)
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Search Box Card */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-2xl border border-borderColor rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: '#171A23', opacity: 1 }}
          >
            {/* Input Row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-borderColor">
              <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search goals, tasks, plans, events..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                className="flex-1 bg-transparent border-0 outline-none text-text-primary text-sm placeholder-text-muted focus:ring-0"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface transition-colors focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-[350px] overflow-y-auto p-2">
              {query.trim().length === 0 ? (
                // Show Recent Searches
                <div>
                  <div className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Recent Searches
                  </div>
                  {recentSearches.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-text-muted italic">
                      No recent searches. Type to search items across your workspace.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRecentClick(search)}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-surface rounded-md transition-colors focus:outline-none"
                        >
                          <Clock className="h-3.5 w-3.5 text-text-muted" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : searchResults.length === 0 ? (
                // Show Empty Search Results
                <div className="py-12 text-center text-xs text-text-muted">
                  No matching results found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                // Show matching search results
                <div className="flex flex-col gap-0.5">
                  <div className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Matching Results ({searchResults.length})
                  </div>
                  {searchResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all duration-100 ${isSelected
                            ? 'bg-primary/10 border-l-2 border-primary pl-2'
                            : 'hover:bg-surface/50 border-l-2 border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md bg-surface border border-borderColor ${isSelected ? 'text-primary' : ''}`}>
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text-primary">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-text-muted font-medium bg-surface px-2 py-0.5 rounded border border-borderColor">
                          Jump to
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 border-t border-borderColor bg-surface/30 text-[10px] text-text-muted flex items-center justify-between">
              <span>Use arrow keys to navigate, enter to select.</span>
              <span>ESC to close</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
