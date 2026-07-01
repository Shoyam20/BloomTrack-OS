import { useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import CommandPalette from '../ui/CommandPalette'
import ToastContainer from '../ui/Toast'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans transition-colors duration-200">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Command Palette search */}
      <CommandPalette />

      {/* Navigation header */}
      <Navbar />

      {/* Page content with transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
