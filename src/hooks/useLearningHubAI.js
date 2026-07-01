import { useStore } from '../store/useStore'
import {
  learningRoadmaps,
  curatedResources,
  curatedFlashcards,
  curatedQuizzes,
  curatedSummaries,
  getFallbackResources,
  getFallbackFlashcards,
  getFallbackQuiz,
  getFallbackSummary,
  findCuratedTopicKey
} from '../data/learningHubStaticData'

// Document API usage constraints
// API_ALLOWED_SURFACES = ['ai-chief-of-staff-chat', 'learning-hub-tutor-chat']

export const useLearningHubAI = () => {
  const { geminiApiKey, learningHub, profile } = useStore()

  const getSystemInstructions = (actionType, topic, category) => {
    const studentProfile = learningHub.studentProfile || profile?.profession || 'Self Learner'
    const skillLevel = learningHub.skillLevel || 'Beginner'
    const goals = profile?.goals?.join(', ') || 'General growth'

    const profileContext = `The student's profile is: ${studentProfile}. Their current skill level is ${skillLevel}. Their learning goals are: ${goals}. The topic they are currently studying is "${topic}" under the category "${category}".`

    if (actionType === 'tutor') {
      return `You are a supportive, high-fidelity AI Personal Tutor for BloomTrack OS. 
      ${profileContext}
      
      Your goal is to act as a real personal tutor, NOT a generic chatbot. Follow these principles:
      1. Explain concepts in simple language tailored to the student's level.
      2. If code is provided, explain it line by line.
      3. Solve academic or coding doubts step-by-step.
      4. Crucial: ALWAYS give hints or ask guided questions first to encourage active thinking, instead of immediately giving away full answers.
      5. Correct and explain their mistakes gently but thoroughly.
      6. Use markdown formatting (bolding, lists, codeblocks) to keep explanations extremely readable and structured.
      7. Be engaging, encouraging, and clear.`
    }

    return ''
  }

  const callGemini = async (actionType, topic, category, additionalPrompt = '') => {
    // 1. Interactive Tutor Chat - Permitted to call Gemini API
    if (actionType === 'tutor') {
      if (!geminiApiKey) {
        throw new Error('MISSING_API_KEY')
      }

      const systemInstruction = getSystemInstructions(actionType, topic, category)
      
      const recentHistory = learningHub.tutorChatHistory
        .slice(-12)
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      const contents = [...recentHistory, { role: 'user', parts: [{ text: additionalPrompt }] }]

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
              parts: [{ text: systemInstruction }]
            }
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error('API_ERROR')
        }

        const responseData = await response.json()
        const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        return text
      } catch (err) {
        clearTimeout(timeoutId)
        console.error(`Gemini learning hub tutor API error:`, err)
        throw err
      }
    }

    // 2. Curated Static Actions - Synchronous/Offline, locked from API access
    if (actionType === 'resources') {
      return getResources(topic)
    }
    if (actionType === 'flashcards') {
      return getFlashcards(topic)
    }
    if (actionType === 'quiz') {
      return getQuiz(topic)
    }
    if (actionType === 'summary') {
      return getSummary(topic)
    }

    return null
  }

  // Curated static getters checking local config then falling back to rules-based template
  const getResources = (topic) => {
    const curatedKey = findCuratedTopicKey(topic)
    return curatedKey && curatedResources[curatedKey]
      ? { resources: curatedResources[curatedKey] }
      : getFallbackResources(topic)
  }

  const getFlashcards = (topic) => {
    const curatedKey = findCuratedTopicKey(topic)
    return curatedKey && curatedFlashcards[curatedKey]
      ? { flashcards: curatedFlashcards[curatedKey] }
      : getFallbackFlashcards(topic)
  }

  const getQuiz = (topic) => {
    const curatedKey = findCuratedTopicKey(topic)
    return curatedKey && curatedQuizzes[curatedKey]
      ? { questions: curatedQuizzes[curatedKey] }
      : getFallbackQuiz(topic)
  }

  const getSummary = (topic) => {
    const curatedKey = findCuratedTopicKey(topic)
    return (curatedKey && curatedSummaries[curatedKey]) || getFallbackSummary(topic)
  }

  return {
    callGemini,
    getFallbackResources: getResources,
    getFallbackFlashcards: getFlashcards,
    getFallbackQuiz: getQuiz,
    getFallbackSummary: getSummary
  }
}
