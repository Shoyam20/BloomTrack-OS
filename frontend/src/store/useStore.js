import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialGoals = [
  {
    id: 'g-1',
    title: 'Master Data Structures & Algorithms',
    category: 'Learning',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    flowerType: 'Lavender',
    progress: 25,
    milestones: [
      { title: 'Learn Arrays & Linked Lists', completed: true },
      { title: 'Understand Trees & Graphs', completed: false },
      { title: 'Master Dynamic Programming', completed: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'g-2',
    title: 'Prepare Placement Portfolio',
    category: 'Career',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    flowerType: 'Sunflower',
    progress: 50,
    milestones: [
      { title: 'Build React Capstone Project', completed: true },
      { title: 'Optimize Resume and LinkedIn', completed: true },
      { title: 'Complete 3 Mock Interviews', completed: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'g-3',
    title: 'Train for 10K Run',
    category: 'Fitness',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    flowerType: 'Rose',
    progress: 10,
    milestones: [
      { title: 'Run 3K without stopping', completed: true },
      { title: 'Run 5K pace-check', completed: false },
      { title: 'Run 8K endurance-check', completed: false }
    ],
    createdAt: new Date().toISOString()
  }
];

const initialTasks = [
  {
    id: 't-1',
    title: 'Solve 5 Dynamic Programming Questions',
    description: 'Practice knapsack, LCS, and grid path problems on LeetCode.',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'High',
    goalId: 'g-1',
    category: 'Daily',
    status: 'In Progress',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    title: 'Review Capstone Project Architecture',
    description: 'Ensure Zustand store and page structure meet the requirements.',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'High',
    goalId: 'g-2',
    category: 'Daily',
    status: 'Done',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-3',
    title: 'LinkedIn Network Expansion',
    description: 'Reach out to 5 senior engineers in target product companies.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    goalId: 'g-2',
    category: 'Weekly',
    status: 'To Do',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-4',
    title: 'Interval Sprint Run (5K)',
    description: '30-second sprints followed by 1-minute walks for 25 minutes total.',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Low',
    goalId: 'g-3',
    category: 'Daily',
    status: 'To Do',
    createdAt: new Date().toISOString()
  }
];

const initialEvents = [
  {
    id: 'e-1',
    title: 'Algorithm Group Study Session',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    duration: '90',
    type: 'Goal',
    linkedId: 'g-1'
  },
  {
    id: 'e-2',
    title: 'Mock Interview - Peer Check',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    duration: '60',
    type: 'Task',
    linkedId: 't-3'
  },
  {
    id: 'e-3',
    title: 'Morning Run & Stretching',
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    duration: '45',
    type: 'Focus',
    linkedId: 'g-3'
  }
];

const initialNotifications = [
  {
    id: 'n-1',
    title: 'Welcome to BloomTrack OS!',
    description: 'Start by planting your goals, tracking tasks, or talking to BloomTrack AI OS.',
    type: 'Info',
    read: false,
    createdAt: new Date().toISOString()
  }
];

export const useStore = create(
  persist(
    (set, get) => ({
      // State
      tasks: initialTasks,
      goals: initialGoals,
      plans: [],
      calendarEvents: initialEvents,
      chatHistory: [
        {
          id: 'c-init',
          role: 'assistant',
          content: 'Hello! I am BloomTrack AI OS. I can help you plan your studies, schedule tasks, or organize your goals. What would you like to achieve today?',
          timestamp: new Date().toISOString()
        }
      ],
      focusSessions: [
        {
          id: 'fs-1',
          duration: 25,
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          taskId: 't-2'
        },
        {
          id: 'fs-2',
          duration: 45,
          completedAt: new Date().toISOString(),
          taskId: 't-1'
        }
      ],
      pendingActions: [],
      notifications: initialNotifications,
      theme: 'dark',
      geminiApiKey: '',
      customApiUrl: 'https://generativelanguage.googleapis.com',
      searchOpen: false,
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      user: null,
      profile: null,
      customResources: {},
      learningHub: {
        selectedTopic: '',
        selectedCategory: 'Programming',
        studentProfile: 'Self Learner',
        skillLevel: 'Beginner',
        learningGoal: '',
        tutorChatHistory: [],
        revisionTopics: []
      },
      garden: {
        xp: 35,
        coins: 10,
        level: 1,
        streak: 3,
        timeline: [
          { id: 't-init', text: 'Welcome to your Workspace! Planted your first learning seed.', timestamp: new Date().toISOString(), xp: 0 }
        ],
        achievements: [
          { id: 'first_quiz', title: 'First Bloom', description: 'Complete your first quiz', unlocked: false, unlockedAt: null },
          { id: 'perfect_score', title: 'Perfect Bloom', description: 'Get 100% on any quiz', unlocked: false, unlockedAt: null },
          { id: 'flashcard_master', title: 'Flashcard Scholar', description: 'Complete a full flashcard set', unlocked: false, unlockedAt: null },
          { id: 'level_5', title: 'Grand Botanist', description: 'Reach Level 5', unlocked: false, unlockedAt: null }
        ]
      },
      isRegistering: false,
      setIsRegistering: (isRegistering) => set({ isRegistering }),
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      upsertProfile: async (profileData) => {
        const user = get().user
        if (!user) return
        set({ profile: { ...profileData, id: user.id } })
      },
      signOut: () => {
        set({
          user: null,
          profile: null,
          customResources: {},
          tasks: [],
          goals: [],
          plans: [],
          focusSessions: [],
          notifications: [],
          calendarEvents: [],
          learningHub: {
            selectedTopic: '',
            selectedCategory: 'Programming',
            studentProfile: 'Self Learner',
            skillLevel: 'Beginner',
            learningGoal: '',
            tutorChatHistory: [],
            revisionTopics: []
          },
          garden: {
            xp: 35,
            coins: 10,
            level: 1,
            streak: 3,
            timeline: [
              { id: 't-init', text: 'Welcome to your Workspace! Planted your first learning seed.', timestamp: new Date().toISOString(), xp: 0 }
            ],
            achievements: [
              { id: 'first_quiz', title: 'First Bloom', description: 'Complete your first quiz', unlocked: false, unlockedAt: null },
              { id: 'perfect_score', title: 'Perfect Bloom', description: 'Get 100% on any quiz', unlocked: false, unlockedAt: null },
              { id: 'flashcard_master', title: 'Flashcard Scholar', description: 'Complete a full flashcard set', unlocked: false, unlockedAt: null },
              { id: 'level_5', title: 'Grand Botanist', description: 'Reach Level 5', unlocked: false, unlockedAt: null }
            ]
          }
        })
      },
      loginUser: (name) => {
        const username = name.trim();
        const users = JSON.parse(localStorage.getItem('bloomtrack_user') || '{}');
        const matchedKey = Object.keys(users).find(
          (key) => key.toLowerCase() === username.toLowerCase()
        );
        if (matchedKey) {
          const userData = users[matchedKey];
          set({
            user: { id: matchedKey, name: matchedKey },
            profile: userData.profile || null,
            customResources: userData.customResources || {},
            tasks: userData.tasks || [],
            goals: userData.goals || [],
            plans: userData.plans || [],
            focusSessions: userData.focusSessions || [],
            calendarEvents: userData.calendarEvents || [],
            chatHistory: userData.chatHistory || [],
            notifications: userData.notifications || [],
            learningHub: userData.learningHub || {
              selectedTopic: '',
              selectedCategory: 'Programming',
              studentProfile: 'Self Learner',
              skillLevel: 'Beginner',
              learningGoal: '',
              tutorChatHistory: [],
              revisionTopics: []
            },
            garden: userData.garden || {
              xp: 35,
              coins: 10,
              level: 1,
              streak: 3,
              timeline: [
                { id: 't-init', text: 'Welcome to your Workspace! Planted your first learning seed.', timestamp: new Date().toISOString(), xp: 0 }
              ],
              achievements: [
                { id: 'first_quiz', title: 'First Bloom', description: 'Complete your first quiz', unlocked: false, unlockedAt: null },
                { id: 'perfect_score', title: 'Perfect Bloom', description: 'Get 100% on any quiz', unlocked: false, unlockedAt: null },
                { id: 'flashcard_master', title: 'Flashcard Scholar', description: 'Complete a full flashcard set', unlocked: false, unlockedAt: null },
                { id: 'level_5', title: 'Grand Botanist', description: 'Reach Level 5', unlocked: false, unlockedAt: null }
              ]
            }
          });
          return true;
        }
        return false;
      },
      registerUser: (profileData) => {
        const username = profileData.full_name.trim();
        const users = JSON.parse(localStorage.getItem('bloomtrack_user') || '{}');
        const userData = {
          profile: profileData,
          customResources: {},
          tasks: [],
          goals: [],
          plans: [],
          focusSessions: [],
          calendarEvents: [],
          chatHistory: [
            {
              id: 'c-init',
              role: 'assistant',
              content: 'Hello! I am BloomTrack AI OS. I can help you plan your studies, schedule tasks, or organize your goals. What would you like to achieve today?',
              timestamp: new Date().toISOString()
            }
          ],
          notifications: [],
          learningHub: {
            selectedTopic: '',
            selectedCategory: 'Programming',
            studentProfile: 'Self Learner',
            skillLevel: 'Beginner',
            learningGoal: '',
            tutorChatHistory: [],
            revisionTopics: []
          },
          garden: {
            xp: 35,
            coins: 10,
            level: 1,
            streak: 3,
            timeline: [
              { id: 't-init', text: 'Welcome to your Workspace! Planted your first learning seed.', timestamp: new Date().toISOString(), xp: 0 }
            ],
            achievements: [
              { id: 'first_quiz', title: 'First Bloom', description: 'Complete your first quiz', unlocked: false, unlockedAt: null },
              { id: 'perfect_score', title: 'Perfect Bloom', description: 'Get 100% on any quiz', unlocked: false, unlockedAt: null },
              { id: 'flashcard_master', title: 'Flashcard Scholar', description: 'Complete a full flashcard set', unlocked: false, unlockedAt: null },
              { id: 'level_5', title: 'Grand Botanist', description: 'Reach Level 5', unlocked: false, unlockedAt: null }
            ]
          }
        };
        users[username] = userData;
        localStorage.setItem('bloomtrack_user', JSON.stringify(users));
        set({
          user: { id: username, name: username },
          profile: profileData,
          customResources: {},
          tasks: [],
          goals: [],
          plans: [],
          focusSessions: [],
          calendarEvents: [],
          chatHistory: userData.chatHistory,
          notifications: [],
          learningHub: userData.learningHub,
          garden: userData.garden
        });
      },

      // Task Actions
      addTask: (task) => set((state) => {
        const newTask = {
          id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description || '',
          deadline: task.deadline || new Date().toISOString().split('T')[0],
          priority: task.priority || 'Medium',
          goalId: task.goalId || '',
          category: task.category || 'Daily',
          status: task.status || 'To Do',
          completedCount: task.completedCount || 0,
          createdAt: new Date().toISOString()
        };
        return { tasks: [...state.tasks, newTask] };
      }),

      updateTask: (id, changes) => set((state) => {
        const updatedTasks = state.tasks.map((task) =>
          task.id === id ? { ...task, ...changes } : task
        )
        return { tasks: updatedTasks }
      }),

      deleteTask: (id) => set((state) => {
        return { tasks: state.tasks.filter((task) => task.id !== id) }
      }),

      setTaskStatus: (id, status) => set((state) => {
        const updatedTasks = state.tasks.map((task) =>
          task.id === id ? { ...task, status } : task
        )
        return { tasks: updatedTasks }
      }),

      addGoal: (goal) => set((state) => {
        const newGoal = {
          id: goal.id || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: goal.title,
          category: goal.category || 'Custom',
          deadline: goal.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          flowerType: goal.flowerType || 'Tulip',
          progress: goal.progress || 0,
          milestones: goal.milestones || [],
          description: goal.description || '',
          hoursPerWeek: goal.hoursPerWeek || 0,
          generationStatus: goal.generationStatus || 'idle',
          generationError: goal.generationError || null,
          completed: goal.completed || false,
          createdAt: new Date().toISOString()
        };
        return { goals: [...state.goals, newGoal] };
      }),

      updateGoal: (id, changes) => set((state) => {
        const updatedGoals = state.goals.map((goal) =>
          goal.id === id ? { ...goal, ...changes } : goal
        )
        return { goals: updatedGoals }
      }),

      deleteGoal: (id) => set((state) => {
        const tasksToDelete = state.tasks.filter((task) => task.goalId === id)
        const taskIdsToDelete = tasksToDelete.map((t) => t.id)

        const nextTasks = state.tasks.filter((task) => task.goalId !== id)
        const nextGoals = state.goals.filter((goal) => goal.id !== id)
        const nextCalendarEvents = state.calendarEvents.filter(
          (event) => event.linkedId !== id && !taskIdsToDelete.includes(event.linkedId)
        )
        const nextFocusSessions = state.focusSessions.filter(
          (session) => !taskIdsToDelete.includes(session.taskId)
        )
        const nextNotifications = state.notifications.filter(
          (noti) => noti.goalId !== id && !taskIdsToDelete.includes(noti.taskId)
        )
        const nextGardenTimeline = state.garden?.timeline?.filter(
          (evt) => evt.goalId !== id && !taskIdsToDelete.includes(evt.taskId)
        ) || []

        return {
          tasks: nextTasks,
          goals: nextGoals,
          calendarEvents: nextCalendarEvents,
          focusSessions: nextFocusSessions,
          notifications: nextNotifications,
          garden: state.garden ? {
            ...state.garden,
            timeline: nextGardenTimeline
          } : undefined
        }
      }),

      updateGoalProgress: (id, percent) => set((state) => {
        const updatedGoals = state.goals.map((goal) =>
          goal.id === id ? { ...goal, progress: Math.min(100, Math.max(0, percent)) } : goal
        )
        return { goals: updatedGoals }
      }),

      addCustomResource: (topic, resource) => set((state) => {
        const normalizedTopic = topic.toLowerCase().trim()
        const topicResources = state.customResources[normalizedTopic] || []
        const newResource = {
          id: `custom-res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          ...resource
        }
        return {
          customResources: {
            ...state.customResources,
            [normalizedTopic]: [...topicResources, newResource]
          }
        }
      }),

      removeCustomResource: (topic, resourceId) => set((state) => {
        const normalizedTopic = topic.toLowerCase().trim()
        const topicResources = state.customResources[normalizedTopic] || []
        const nextResources = topicResources.filter((r) => r.id !== resourceId)
        return {
          customResources: {
            ...state.customResources,
            [normalizedTopic]: nextResources
          }
        }
      }),

      // Plan Actions
      addPlan: (plan) => set((state) => {
        const newPlan = {
          id: plan.id || `plan-${Date.now()}`,
          title: plan.title,
          roadmap: plan.roadmap || [],
          tasks: plan.tasks || [],
          milestones: plan.milestones || [],
          status: plan.status || 'pending',
          createdAt: new Date().toISOString()
        };
        return { plans: [...state.plans, newPlan] };
      }),

      approvePlan: (id) => set((state) => {
        const plan = state.plans.find((p) => p.id === id);
        if (!plan) return {};

        const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create goal from plan
        const newGoal = {
          id: goalId,
          title: plan.title,
          category: 'Learning', // Default category
          deadline: plan.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          flowerType: 'Lavender',
          progress: 0,
          milestones: plan.milestones.map((m) => ({ title: m.title, completed: false })),
          completed: false,
          createdAt: new Date().toISOString()
        };

        // Create tasks from plan
        const newTasks = plan.tasks.map((task, index) => ({
          id: `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          title: task.title,
          description: task.description || '',
          deadline: task.deadline || new Date().toISOString().split('T')[0],
          priority: task.priority || 'Medium',
          goalId: goalId,
          category: task.category || 'Weekly',
          status: 'To Do',
          completedCount: 0,
          createdAt: new Date().toISOString()
        }));

        // Filter out from plans or set to approved
        const updatedPlans = state.plans.map((p) =>
          p.id === id ? { ...p, status: 'approved' } : p
        );

        return {
          goals: [...state.goals, newGoal],
          tasks: [...state.tasks, ...newTasks],
          plans: updatedPlans
        };
      }),

      rejectPlan: (id) => set((state) => {
        const updatedPlans = state.plans.map((p) => p.id === id ? { ...p, status: 'rejected' } : p)
        return { plans: updatedPlans }
      }),

      // Calendar Events Actions
      addCalendarEvent: (event) => set((state) => {
        const newEvent = {
          id: event.id || `event-${Date.now()}`,
          title: event.title,
          date: event.date || new Date().toISOString().split('T')[0],
          time: event.time || '12:00',
          duration: event.duration || '60',
          type: event.type || 'Other',
          linkedId: event.linkedId || ''
        };
        return { calendarEvents: [...state.calendarEvents, newEvent] };
      }),

      deleteCalendarEvent: (id) => set((state) => ({
        calendarEvents: state.calendarEvents.filter((event) => event.id !== id)
      })),

      // Chat Actions
      addChatMessage: (message) => set((state) => {
        const newMessage = {
          id: message.id || `chat-${Date.now()}`,
          role: message.role,
          content: message.content,
          actions: message.actions || null,
          trace: message.trace || null,
          activeAgents: message.activeAgents || null,
          timestamp: new Date().toISOString()
        };
        return { chatHistory: [...state.chatHistory, newMessage] };
      }),

      clearChat: () => set(() => ({
        chatHistory: [
          {
            id: `chat-${Date.now()}`,
            role: 'assistant',
            content: 'Chat history cleared. How else can I assist you with your productivity?',
            timestamp: new Date().toISOString()
          }
        ]
      })),

      // Focus Session Actions
      addFocusSession: (session) => set((state) => {
        const newSession = {
          id: `focus-${Date.now()}`,
          duration: session.duration,
          completedAt: new Date().toISOString(),
          taskId: session.taskId || ''
        };
        return { focusSessions: [...state.focusSessions, newSession] };
      }),

      // Notifications Actions
      addNotification: (noti) => set((state) => {
        const newNoti = {
          id: noti.id || `noti-${Date.now()}`,
          title: noti.title,
          description: noti.description || '',
          type: noti.type || 'Info',
          read: false,
          createdAt: new Date().toISOString()
        };
        return { notifications: [newNoti, ...state.notifications] };
      }),

      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),

      // Theme Actions
      toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
        return { theme: nextTheme };
      }),

      setGeminiApiKey: (geminiApiKey) => set(() => ({ geminiApiKey })),
      setCustomApiUrl: (customApiUrl) => set(() => ({ customApiUrl })),

      selectTopic: (topic, category) => set((state) => ({
        learningHub: { ...state.learningHub, selectedTopic: topic, selectedCategory: category, tutorChatHistory: [] }
      })),
      updateStudentLearningProfile: (changes) => set((state) => ({
        learningHub: { ...state.learningHub, ...changes }
      })),
      addTutorMessage: (msg) => set((state) => {
        const newMsg = {
          id: `tutor-${Date.now()}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString()
        }
        return {
          learningHub: {
            ...state.learningHub,
            tutorChatHistory: [...state.learningHub.tutorChatHistory, newMsg]
          }
        }
      }),
      clearTutorChat: () => set((state) => ({
        learningHub: { ...state.learningHub, tutorChatHistory: [] }
      })),
      addXPAwards: (xpAmount, coinsAmount, type, topicName) => set((state) => {
        const nextXp = state.garden.xp + xpAmount
        const nextCoins = state.garden.coins + coinsAmount
        const nextLevel = Math.floor(nextXp / 100) + 1
        
        let addedNotis = []
        if (nextLevel > state.garden.level) {
          addedNotis = [{
            id: `lvl-${Date.now()}`,
            title: `🎉 Leveled Up to Level ${nextLevel}!`,
            description: `Keep up the amazing work! You are now Level ${nextLevel}.`,
            type: 'Info',
            read: false,
            createdAt: new Date().toISOString()
          }]
        }

        const newTimelineEvent = {
          id: `time-${Date.now()}`,
          text: `Earned +${xpAmount} XP & +${coinsAmount} Coins: completed ${type} on "${topicName}"`,
          timestamp: new Date().toISOString(),
          xp: xpAmount
        }

        const nextAchievements = state.garden.achievements.map((ach) => {
          if (ach.id === 'level_5' && nextLevel >= 5 && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          if (ach.id === 'flashcard_master' && type === 'Flashcards' && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          return ach
        })

        return {
          garden: {
            ...state.garden,
            xp: nextXp,
            coins: nextCoins,
            level: nextLevel,
            achievements: nextAchievements,
            timeline: [newTimelineEvent, ...state.garden.timeline]
          },
          notifications: [...addedNotis, ...state.notifications]
        }
      }),

      recordQuizScore: (topic, score, totalQuestions, difficulty) => set((state) => {
        const percent = score / totalQuestions
        const passed = percent >= 0.6
        const perfect = percent === 1.0

        let xpEarned = 10
        let coinsEarned = 5
        if (passed) {
          xpEarned = difficulty === 'Hard' ? 45 : difficulty === 'Medium' ? 35 : 25
          coinsEarned = difficulty === 'Hard' ? 25 : difficulty === 'Medium' ? 20 : 15
        }

        const nextXp = state.garden.xp + xpEarned
        const nextCoins = state.garden.coins + coinsEarned
        const nextLevel = Math.floor(nextXp / 100) + 1
        
        let addedNotis = []
        if (nextLevel > state.garden.level) {
          addedNotis = [{
            id: `lvl-${Date.now()}`,
            title: `🎉 Leveled Up to Level ${nextLevel}!`,
            description: `Keep up the amazing work! You are now Level ${nextLevel}.`,
            type: 'Info',
            read: false,
            createdAt: new Date().toISOString()
          }]
        }

        const newTimelineEvent = {
          id: `time-${Date.now()}`,
          text: `Quiz Score: ${score}/${totalQuestions} (${Math.round(percent*100)}%) on "${topic}" [${difficulty}]`,
          timestamp: new Date().toISOString(),
          xp: xpEarned
        }

        const nextRevisionTopics = [...state.learningHub.revisionTopics]
        if (!passed) {
          if (!nextRevisionTopics.includes(topic)) {
            nextRevisionTopics.push(topic)
          }
        } else {
          const index = nextRevisionTopics.indexOf(topic)
          if (index !== -1) {
            nextRevisionTopics.splice(index, 1)
          }
        }

        const nextAchievements = state.garden.achievements.map((ach) => {
          if (ach.id === 'first_quiz' && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          if (ach.id === 'perfect_score' && perfect && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          if (ach.id === 'level_5' && nextLevel >= 5 && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          return ach
        })

        return {
          garden: {
            ...state.garden,
            xp: nextXp,
            coins: nextCoins,
            level: nextLevel,
            achievements: nextAchievements,
            timeline: [newTimelineEvent, ...state.garden.timeline]
          },
          learningHub: {
            ...state.learningHub,
            revisionTopics: nextRevisionTopics
          },
          notifications: [...addedNotis, ...state.notifications]
        }
      }),

      generateSubGoals: async (goalId) => {
        const state = get()
        const goal = state.goals.find((g) => g.id === goalId)
        if (!goal) return

        // Set generating status
        state.updateGoal(goalId, { 
          generationStatus: 'generating', 
          generationError: null 
        })

        // Simulate a brief delay for UX transition, then resolve synchronously
        await new Promise((resolve) => setTimeout(resolve, 300))

        try {
          const category = goal.category || 'Custom'
          let milestones = []
          let dailyTasks = []

          if (category.toLowerCase() === 'learning') {
            milestones = [
              { title: 'Week 1: Research foundations and core theory', weekNumber: 1, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 2: Complete practical exercises and review cards', weekNumber: 2, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 3: Solve intermediate problem sets and quiz check', weekNumber: 3, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            ]
            dailyTasks = [
              { title: 'Read introduction and set study schedule', day: 'Monday' },
              { title: 'Study key terms and note-taking', day: 'Tuesday' },
              { title: 'Complete mid-week practice questions', day: 'Wednesday' },
              { title: 'Review incorrect questions and flashcards', day: 'Thursday' },
              { title: 'Take mock test and review notes', day: 'Friday' }
            ]
          } else if (category.toLowerCase() === 'career') {
            milestones = [
              { title: 'Week 1: Update professional profile and portfolio', weekNumber: 1, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 2: Apply to 5 target positions and network', weekNumber: 2, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 3: Complete mock interview practice', weekNumber: 3, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            ]
            dailyTasks = [
              { title: 'Refine resume bullet points', day: 'Monday' },
              { title: 'Update LinkedIn profile sections', day: 'Tuesday' },
              { title: 'Research 3 target companies', day: 'Wednesday' },
              { title: 'Reach out to 2 industry professionals', day: 'Thursday' },
              { title: 'Prepare stories for behavioral questions', day: 'Friday' }
            ]
          } else if (category.toLowerCase() === 'fitness') {
            milestones = [
              { title: 'Week 1: Establish baseline routine and nutrition tracker', weekNumber: 1, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 2: Consistent 3 days/week workouts', weekNumber: 2, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 3: Increment intensity or load', weekNumber: 3, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            ]
            dailyTasks = [
              { title: 'Perform active stretching and setup goals', day: 'Monday' },
              { title: 'Cardiorespiratory training session (30 mins)', day: 'Tuesday' },
              { title: 'Rest day with walking or mobility work', day: 'Wednesday' },
              { title: 'Strength training workout', day: 'Thursday' },
              { title: 'Log metrics and review weekly progress', day: 'Friday' }
            ]
          } else {
            // Project / Custom
            milestones = [
              { title: 'Week 1: Finalize specifications and design outline', weekNumber: 1, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 2: Set up environment and implement core features', weekNumber: 2, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
              { title: 'Week 3: Bug testing, styling, and final checks', weekNumber: 3, dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            ]
            dailyTasks = [
              { title: 'List requirements and draw diagrams', day: 'Monday' },
              { title: 'Initialize repository and build layout structure', day: 'Tuesday' },
              { title: 'Code main functional logic blocks', day: 'Wednesday' },
              { title: 'Integrate components and fix UI constraints', day: 'Thursday' },
              { title: 'Perform walkthrough and verify edge cases', day: 'Friday' }
            ]
          }

          // 1. Save milestones under the goal
          const newMilestones = milestones.map((m) => ({
            title: m.title,
            completed: false,
            weekNumber: m.weekNumber,
            dueDate: m.dueDate
          }))

          // 2. Save daily tasks into the Daily tab of Tasks (localStorage) with goalId linked
          const newTasks = dailyTasks.map((t, index) => {
            // Map day string to date
            let deadlineDate = new Date()
            const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            const dayIdx = daysOfWeek.indexOf(t.day?.toLowerCase() || '')
            if (dayIdx !== -1) {
              const currentDay = new Date().getDay()
              const diff = dayIdx - currentDay
              deadlineDate.setDate(deadlineDate.getDate() + diff)
            }
            const deadlineStr = deadlineDate.toISOString().split('T')[0]

            return {
              id: `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
              title: t.title,
              description: `Generated daily task for goal: ${goal.title}`,
              deadline: deadlineStr,
              priority: 'Medium',
              goalId: goalId, // Ensure goalId is linked
              category: 'Daily', // Shows in Daily tab automatically
              status: 'To Do',
              completedCount: 0,
              createdAt: new Date().toISOString()
            }
          })

          set((state) => {
            // Update the specific goal
            const updatedGoals = state.goals.map((g) =>
              g.id === goalId
                ? { ...g, milestones: newMilestones, generationStatus: 'success' }
                : g
            )
            return {
              goals: updatedGoals,
              tasks: [...state.tasks, ...newTasks]
            }
          })

        } catch (error) {
          console.error('Error generating sub goals:', error)
          state.updateGoal(goalId, {
            generationStatus: 'failed',
            generationError: error.message || 'Failed to generate sub-goals'
          })
        }
      }
    }),
    {
      name: 'bloomtrack-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        tasks: state.tasks,
        goals: state.goals,
        plans: state.plans,
        calendarEvents: state.calendarEvents,
        chatHistory: state.chatHistory,
        focusSessions: state.focusSessions,
        notifications: state.notifications,
        theme: state.theme,
        geminiApiKey: state.geminiApiKey,
        customApiUrl: state.customApiUrl,
        learningHub: state.learningHub,
        garden: state.garden
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on hydrate
        if (state) {
          const currentTheme = state.theme || 'dark';
          if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
          }
        }
      }
    }
  )
);

// Subscribe to store updates to automatically sync the active user's data back to local storage
useStore.subscribe((state) => {
  if (state.user?.id) {
    const users = JSON.parse(localStorage.getItem('bloomtrack_user') || '{}');
    users[state.user.id] = {
      profile: state.profile,
      tasks: state.tasks,
      goals: state.goals,
      plans: state.plans,
      calendarEvents: state.calendarEvents,
      chatHistory: state.chatHistory,
      focusSessions: state.focusSessions,
      notifications: state.notifications,
      learningHub: state.learningHub,
      garden: state.garden,
      customResources: state.customResources
    };
    localStorage.setItem('bloomtrack_user', JSON.stringify(users));
  }
});
