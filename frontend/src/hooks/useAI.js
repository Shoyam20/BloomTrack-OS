import { useStore } from '../store/useStore'

// Document API usage constraints
// API_ALLOWED_SURFACES = ['ai-chief-of-staff-chat', 'learning-hub-tutor-chat']

export const useAI = () => {
  const { geminiApiKey, customApiUrl, chatHistory, profile } = useStore()

  const getPersonalizedPrompt = (profile) => {
    if (!profile) {
      return `You are BloomTrack AI OS, an AI-powered Personal Operating System for growth. Your role is to help users manage their goals, tasks, study plans, and productivity. You are intelligent, direct, and proactive.`
    }

    const {
      full_name,
      profession,
      school_name,
      grade,
      board,
      college_name,
      degree,
      branch,
      year,
      company_name,
      job_role,
      experience,
      startup_name,
      industry,
      stage,
      description,
      goals = [],
      daily_hours
    } = profile

    let details = ''
    if (profession === 'School Student') {
      details = `a School Student studying at ${school_name || 'their school'} in grade/class ${grade || 'unknown'} (${board || 'unknown'} board)`
    } else if (profession === 'College Student') {
      details = `a College Student studying ${degree || 'unknown'} (${branch || 'unknown'}) in year ${year || 'unknown'} at ${college_name || 'their college'}`
    } else if (profession === 'Working Professional') {
      details = `a Working Professional working as a ${job_role || 'professional'} at ${company_name || 'their company'} with ${experience || 0} years of experience`
    } else if (profession === 'Entrepreneur') {
      details = `an Entrepreneur running a venture called ${startup_name || 'their startup'} in the ${industry || 'unknown'} industry (stage: ${stage || 'unknown'})`
    } else {
      details = `an individual who describes themselves as: "${description || 'Other'}"`
    }

    const goalsStr = goals && goals.length > 0 ? goals.join(', ') : 'not specified yet'
    const hoursStr = daily_hours ? `${daily_hours}h/day` : 'flexible hours'

    return `You are BloomTrack AI OS for ${full_name || 'the user'}, ${details}. Their goals are: ${goalsStr}. They have ${hoursStr} available. Help them plan, track, and achieve their goals.`
  }

  const todayDateStr = new Date().toISOString().split('T')[0]

  const basePrompt = `Your role is to help users manage their goals, tasks, study plans, and productivity. You are intelligent, direct, and proactive.

Always calculate deadlines from today's actual date (which is ${todayDateStr}). Never use hardcoded past dates like 2024-xx-xx. If the user says '6 months', the deadline = today + 6 months.

When the user wants to create a goal, task, calendar event, or study plan, respond with:
1. A natural, conversational message
2. A structured JSON action block at the END of your response in this exact format:

ACTION_START
{
  "type": "create_task" | "create_goal" | "create_plan" | "schedule_event",
  "data": { ...relevant fields }
}
ACTION_END

For create_plan, include: { "title": "Plan Title", "roadmap": ["roadmap step 1", "roadmap step 2"], "milestones": [{"title": "milestone 1", "deadline": "YYYY-MM-DD"}], "tasks": [{"title": "task 1", "description": "task desc", "deadline": "YYYY-MM-DD", "priority": "High"|"Medium"|"Low", "category": "Daily"|"Weekly"|"Monthly"}] }
For create_goal, include: { "title": "Goal Title", "category": "Learning"|"Career"|"Fitness"|"Project"|"Custom", "deadline": "YYYY-MM-DD", "flowerType": "Lavender"|"Sunflower"|"Rose"|"Orchid"|"Tulip" }
For create_task, include: { "title": "Task Title", "description": "Task desc", "deadline": "YYYY-MM-DD", "priority": "High"|"Medium"|"Low", "category": "Daily"|"Weekly"|"Monthly" }
For schedule_event, include: { "title": "Event Title", "date": "YYYY-MM-DD", "time": "HH:MM", "duration": "30"|"60"|"90", "type": "Task"|"Goal"|"Focus"|"Other" }

Always ask clarifying questions if the user's request is vague. Be encouraging and coach the user.`

  const systemPrompt = `${getPersonalizedPrompt(profile)}\n\n${basePrompt}`

  const sendMessage = async (userText) => {
    if (!geminiApiKey) {
      throw new Error('MISSING_API_KEY')
    }

    const state = useStore.getState()
    const workspaceState = {
      tasks: state.tasks,
      goals: state.goals,
      plans: state.plans,
      calendarEvents: state.calendarEvents,
      garden: state.garden,
      customResources: state.customResources,
      notifications: state.notifications,
      profile: state.profile
    }

    // Try calling the backend Multi-Agent Orchestrator
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const backendResponse = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': geminiApiKey
        },
        body: JSON.stringify({
          message: userText,
          chatHistory: chatHistory.filter((msg) => msg.id !== 'c-init').slice(-10),
          workspaceState,
          profile,
          customApiUrl
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (backendResponse.ok) {
        const responseData = await backendResponse.json()
        
        // Sync updated state from backend directly to frontend Zustand store
        if (responseData.updatedState) {
          useStore.setState({
            tasks: responseData.updatedState.tasks || state.tasks,
            goals: responseData.updatedState.goals || state.goals,
            calendarEvents: responseData.updatedState.calendarEvents || state.calendarEvents,
            garden: responseData.updatedState.garden || state.garden,
            customResources: responseData.updatedState.customResources || state.customResources,
            notifications: responseData.updatedState.notifications || state.notifications,
            profile: responseData.updatedState.profile || state.profile
          })
        }

        return {
          content: responseData.content,
          trace: responseData.trace || [],
          activeAgents: responseData.activeAgents || []
        }
      } else {
        console.warn('Backend server returned error, falling back to client-side Gemini.')
      }
    } catch (err) {
      console.warn('Backend server connection failed, falling back to client-side Gemini:', err.message)
    }

    // FALLBACK: Client-side single agent Gemini API call
    const recentHistory = chatHistory
      .filter((msg) => msg.id !== 'c-init')
      .slice(-10)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

    const contents = [
      ...recentHistory,
      { role: 'user', parts: [{ text: userText }] }
    ]

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API Fallback Error:', errorText)
        throw new Error('API_ERROR')
      }

      const responseData = await response.json()
      const assistantText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const parsed = parseResponse(assistantText)
      
      return {
        content: parsed.content,
        actions: parsed.actions,
        trace: [
          {
            type: 'thought',
            agent: 'Single Agent (Fallback)',
            text: 'Backend offline. Response generated via client-side fallback.'
          }
        ]
      }

    } catch (err) {
      console.error('Gemini Fetch Exception:', err)
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error('TIMEOUT')
      }
      throw err
    }
  }

  // Parse response text to extract natural message and structured action JSON block
  const parseResponse = (text) => {
    const actionStartTag = 'ACTION_START'
    const actionEndTag = 'ACTION_END'

    const startIndex = text.indexOf(actionStartTag)
    const endIndex = text.indexOf(actionEndTag)

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const naturalMessage = text.substring(0, startIndex).trim()
      const jsonBlockStr = text.substring(startIndex + actionStartTag.length, endIndex).trim()

      try {
        const actionData = JSON.parse(jsonBlockStr)
        return {
          content: naturalMessage,
          actions: actionData
        }
      } catch (e) {
        console.error('Failed to parse Action Block JSON:', e)
        return {
          content: text,
          actions: null
        }
      }
    }

    return {
      content: text,
      actions: null
    }
  }

  return { sendMessage }
}
