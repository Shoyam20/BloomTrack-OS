import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sun, Moon, Bell, Menu, X, Flower2, Check } from 'lucide-react'

export default function Navbar() {
  const {
    theme,
    toggleTheme,
    notifications,
    dismissNotification,
    markAllNotificationsAsRead,
    setSearchOpen,
    user,
    signOut
  } = useStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notiOpen, setNotiOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notiRef = useRef(null)
  const profileRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Learning Hub', path: '/learning-hub' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Focus', path: '/focus' },
    { name: 'BloomTrack AI OS', path: '/ai' },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-borderColor backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 text-primary group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-200"
            >
              <Flower2 className="h-6 w-6 stroke-[2]" />
            </motion.div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent">
              BloomTrack OS
            </span>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative py-1 text-sm font-medium transition-colors duration-200 focus:outline-none ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBorder"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right: Search, Theme, Notification, Profile */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface border border-transparent hover:border-borderColor transition-all duration-200 focus:outline-none"
              title="Search (Cmd+K)"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface border border-transparent hover:border-borderColor transition-all duration-200 focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notiRef}>
              <button
                onClick={() => setNotiOpen(!notiOpen)}
                className={`p-2 rounded-lg border border-transparent transition-all duration-200 focus:outline-none ${
                  notiOpen || unreadCount > 0
                    ? 'text-primary bg-primary/5 border-primary/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface hover:border-borderColor'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notiOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto border border-borderColor rounded-lg bg-card shadow-xl glass z-50 p-2"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-borderColor mb-1">
                      <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-primary hover:text-blue-400 font-medium flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-text-muted">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {notifications.map((noti) => (
                          <div
                            key={noti.id}
                            onClick={() => dismissNotification(noti.id)}
                            className={`p-2.5 rounded-md hover:bg-surface cursor-pointer border border-transparent hover:border-borderColor transition-all flex items-start justify-between gap-2 group ${
                              !noti.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-xs font-medium text-text-primary group-hover:text-primary transition-colors">
                                {noti.title}
                              </p>
                              <p className="text-[11px] text-text-muted mt-0.5">
                                {noti.description}
                              </p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 text-[10px] text-text-muted hover:text-danger p-0.5 rounded transition-all">
                              Dismiss
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="h-8 w-8 rounded-full border border-borderColor flex items-center justify-center overflow-hidden hover:border-primary transition-all duration-200 focus:outline-none"
                title="User profile"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                    {user?.user_metadata?.full_name ? user.user_metadata.full_name.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 border border-borderColor rounded-lg bg-card shadow-xl glass z-50 p-3 flex flex-col gap-2"
                  >
                    <div className="border-b border-borderColor/50 pb-2">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {user?.user_metadata?.full_name || 'Student User'}
                      </p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">
                        {user?.email || 'student@bloomtrack.edu'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        signOut()
                      }}
                      className="w-full text-left py-1.5 px-2 rounded-md hover:bg-danger/10 hover:text-danger text-text-muted text-xs transition-colors duration-150"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Search Toggle (Mobile) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg focus:outline-none"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-borderColor bg-card/95 glass overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-text-muted hover:bg-surface hover:text-text-primary'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {/* Notification Badge inside Mobile view */}
              {unreadCount > 0 && (
                <div className="flex items-center justify-between px-3 py-2 mt-2 bg-primary/5 border border-primary/20 rounded-md">
                  <span className="text-xs text-text-primary flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-primary" />
                    You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      markAllNotificationsAsRead()
                      setMobileMenuOpen(false)
                    }}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Profile in Mobile Drawer */}
              <div className="border-t border-borderColor/50 pt-3 mt-1 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full border border-borderColor overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                        {user?.user_metadata?.full_name ? user.user_metadata.full_name.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate max-w-[120px]">
                      {user?.user_metadata?.full_name || 'Student User'}
                    </p>
                    <p className="text-[10px] text-text-muted truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut()
                  }}
                  className="text-xs text-danger font-medium hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
