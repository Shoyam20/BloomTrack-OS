import { mcpServer } from "../mcp/server.js";

// Helper to execute a tool on the MCP server directly
async function executeMcpTool(toolName, toolArgs) {
  // Retrieve the registered tool handler from the MCP server
  const handler = mcpServer._requestHandlers.get("call_tool");
  if (!handler) {
    throw new Error("No call_tool handler registered on MCP server");
  }
  const result = await handler({
    method: "call_tool",
    params: {
      name: toolName,
      arguments: toolArgs
    }
  });
  return result;
}

// Convert MCP tools schema to Gemini function declarations
function getGeminiTools(toolNames) {
  const listHandler = mcpServer._requestHandlers.get("list_tools");
  if (!listHandler) return [];

  // Get tools list from schema
  let mcpTools = [];
  // Synchronous call to get registered tools
  listHandler().then(res => { mcpTools = res.tools; }).catch(() => {});
  
  // Handlers are registered and synchronous, but if they are lazy, we can fallback.
  // Since we registered list_tools, it will return immediately. Let's hardcode the tool mapping for Gemini
  // to ensure robust structure and avoid async race conditions during model initialization.
  const allTools = [
    {
      name: "manage_calendar",
      description: "Manage calendar and schedule. Can list, create or delete events.",
      parameters: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING", enum: ["list", "create", "delete"], description: "The action to perform." },
          eventData: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Title of event." },
              date: { type: "STRING", description: "Event date YYYY-MM-DD." },
              time: { type: "STRING", description: "Time of day HH:MM." },
              duration: { type: "STRING", description: "Duration in minutes." },
              type: { type: "STRING", enum: ["Task", "Goal", "Focus", "Other"] },
              linkedId: { type: "STRING" }
            },
            required: ["title", "date", "time"]
          },
          eventId: { type: "STRING" }
        },
        required: ["action"]
      }
    },
    {
      name: "search_resources",
      description: "Find study materials, cheatsheets, or register custom study resource urls.",
      parameters: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING", enum: ["search", "add_custom"] },
          topic: { type: "STRING", description: "The topic, e.g., 'Dynamic Programming'." },
          resourceData: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              url: { type: "STRING" },
              type: { type: "STRING", enum: ["Video", "Doc", "Article", "Cheat Sheet", "Practice"] }
            },
            required: ["title", "url", "type"]
          }
        },
        required: ["action", "topic"]
      }
    },
    {
      name: "manage_tasks",
      description: "Manage tasks in the workspace. Add new tasks, update status, list, or delete tasks.",
      parameters: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING", enum: ["list", "create", "update_status", "delete"] },
          taskData: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING" },
              deadline: { type: "STRING" },
              priority: { type: "STRING", enum: ["High", "Medium", "Low"] },
              category: { type: "STRING", enum: ["Daily", "Weekly", "Monthly"] },
              goalId: { type: "STRING" }
            },
            required: ["title"]
          },
          taskId: { type: "STRING" },
          status: { type: "STRING", enum: ["To Do", "In Progress", "Done"] }
        },
        required: ["action"]
      }
    },
    {
      name: "manage_progress",
      description: "Get user stats, update goal progress, or award XP and coins.",
      parameters: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING", enum: ["get_stats", "award_xp", "update_goal_progress"] },
          goalId: { type: "STRING" },
          progressPercent: { type: "INTEGER" },
          xpAmount: { type: "INTEGER" },
          coinsAmount: { type: "INTEGER" },
          reason: { type: "STRING" }
        },
        required: ["action"]
      }
    },
    {
      name: "create_goal",
      description: "Create a main study goal in the workspace with milestones.",
      parameters: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Title of the goal." },
          category: { type: "STRING", enum: ["Learning", "Career", "Fitness", "Project", "Custom"] },
          deadline: { type: "STRING", description: "Deadline date in YYYY-MM-DD." },
          flowerType: { type: "STRING", enum: ["Lavender", "Sunflower", "Rose", "Orchid", "Tulip"], description: "Visual seed to grow in the botanical garden." },
          milestones: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                completed: { type: "BOOLEAN" }
              },
              required: ["title"]
            }
          }
        },
        required: ["title"]
      }
    },
    {
      name: "add_notification",
      description: "Create a workspace notification to inform the user about actions.",
      parameters: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Title of the notification." },
          description: { type: "STRING", description: "Details of the notification." },
          type: { type: "STRING", enum: ["Info", "Warning", "Success"] }
        },
        required: ["title"]
      }
    }
  ];

  return allTools.filter(t => toolNames.includes(t.name));
}

// The core agent loop that interacts with Google Gemini
export async function runAgentLoop({ agentName, systemInstruction, userMessage, chatHistory = [], tools = [], apiKey, customApiUrl }) {
  const trace = [];
  
  // Format history for Gemini API
  const contents = chatHistory.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));
  
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const geminiTools = getGeminiTools(tools);
  
  try {
    // Call Gemini API Studio URL directly, matching the frontend's fetching strategy
    const baseUrl = customApiUrl || "https://generativelanguage.googleapis.com";
    const url = `${baseUrl}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      loopCount++;
      
      const payload = {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      if (geminiTools.length > 0) {
        payload.tools = [{ functionDeclarations: geminiTools }];
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${errText}`);
      }

      const responseData = await response.json();
      console.log(`[DEBUG] Gemini response for agent ${agentName}:`, JSON.stringify(responseData, null, 2));
      const candidate = responseData.candidates?.[0];
      const modelContent = candidate?.content;
      
      if (!modelContent) {
        throw new Error(`Empty model response received from Gemini. Full response: ${JSON.stringify(responseData)}`);
      }

      // Check for function calls (tool executions)
      const functionCalls = modelContent.parts?.filter(p => p.functionCall);
      
      if (functionCalls && functionCalls.length > 0) {
        // Log model's thought process if any text was returned before the tool call
        const textThought = modelContent.parts?.find(p => p.text)?.text;
        if (textThought) {
          trace.push({ type: "thought", agent: agentName, text: textThought });
        }

        // Add model's function calls to content history
        contents.push({ role: "model", parts: modelContent.parts });

        // Execute each requested tool
        const responseParts = [];
        for (const call of functionCalls) {
          const { name: toolName, args: toolArgs } = call.functionCall;
          
          trace.push({
            type: "tool_call",
            agent: agentName,
            tool: toolName,
            args: toolArgs
          });

          // Run tool and get output with self-correction handler
          let resultText = "";
          let isToolError = false;
          try {
            const toolResult = await executeMcpTool(toolName, toolArgs);
            if (toolResult && toolResult.isError) {
              isToolError = true;
              resultText = toolResult.content?.[0]?.text || "Unknown MCP tool execution error.";
            } else {
              resultText = toolResult?.content?.[0]?.text || JSON.stringify(toolResult);
            }
          } catch (err) {
            isToolError = true;
            resultText = `Execution error: ${err.message}. Please correct the parameters and try again.`;
          }

          trace.push({
            type: "tool_response",
            agent: agentName,
            tool: toolName,
            isError: isToolError,
            result: resultText
          });

          responseParts.push({
            functionResponse: {
              name: toolName,
              response: { result: resultText, isError: isToolError }
            }
          });
        }

        // Add tool execution results back to history for the next model turn
        contents.push({ role: "user", parts: responseParts });
      } else {
        // No function calls: this is the final text response!
        const text = modelContent.parts?.find(p => p.text)?.text || "";
        trace.push({ type: "final_response", agent: agentName, text });
        return { text, trace };
      }
    }

    throw new Error("Exceeded maximum tool calling loop depth");
  } catch (error) {
    console.error(`Error in agent ${agentName}:`, error);
    trace.push({ type: "error", agent: agentName, text: error.message });
    return { text: `Error running agent ${agentName}: ${error.message}`, trace };
  }
}

// ----------------------------------------------------
// Specialized Agents Prompts & Systems
// ----------------------------------------------------

export const SPECIALIST_AGENTS = {
  PlannerAgent: {
    name: "Planner Agent",
    tools: ["manage_tasks", "manage_calendar", "manage_progress", "create_goal", "add_notification"],
    getSystemPrompt: (profile) => {
      const today = new Date().toISOString().split("T")[0];
      return `You are the Planner Agent for BloomTrack OS (today's date is ${today}).
      You are responsible for creating study plans, setting milestones, and scheduling tasks/calendar events.
      
      When the Coordinator Agent delegates a task:
      1. Create the main Goal in the workspace using the 'create_goal' tool, selecting a visual flower seed to plant (Lavender, Sunflower, Rose, Orchid, Tulip).
      2. Define clear, action-oriented, granular tasks using 'manage_tasks'.
      3. Set logical deadline dates based on today's date (${today}). Do not use past dates.
      4. Link tasks to the newly created goalId.
      5. Schedule calendar events (study slots or focus blocks) using 'manage_calendar'.
      6. Notify the user of the new curriculum structure using 'add_notification'.
      7. Award the user +25 XP and +10 Coins using the 'manage_progress' tool (action: 'award_xp', xpAmount: 25, coinsAmount: 10, reason: "Created study plan") to celebrate this learning roadmap.
      
      Always use the MCP tools to implement the plan. Explain your planning choices clearly to the user.`;
    }
  },

  TutorAgent: {
    name: "Tutor Agent",
    tools: ["search_resources", "manage_progress", "add_notification"],
    getSystemPrompt: (profile) => {
      return `You are the Tutor Agent for BloomTrack OS.
      You help the user learn academic and programming topics, answer doubts, and explain concepts step-by-step.
      
      Guidelines:
      1. Give hints and ask guided questions instead of just vomiting code or answers immediately.
      2. When teaching a topic, use the 'search_resources' tool to find relevant documentation, cheat sheets, or videos.
      3. Notify the user of study progress using 'add_notification'.
      4. Award the user +20 XP and +5 Coins using the 'manage_progress' tool (action: 'award_xp', xpAmount: 20, coinsAmount: 5, reason: "Resolved doubt") to reward their curiosity.
      5. Keep explanations structured, using markdown bullet points, bolding, and code snippets.`;
    }
  },

  MotivationAgent: {
    name: "Motivation Agent",
    tools: ["manage_progress", "add_notification"],
    getSystemPrompt: (profile) => {
      return `You are the Motivation Agent for BloomTrack OS.
      You are high-energy, encouraging, and gamification-oriented.
      
      Guidelines:
      1. Celebrate user achievements, completions, and progress.
      2. Award XP and Coins to the user using the 'manage_progress' tool (action: 'award_xp').
         XP guidelines:
         - Created a study plan: +25 XP
         - Resolved a complex doubt: +20 XP
         - Created a calendar block: +10 XP
      3. Notify the user of level-ups or awards using 'add_notification'.
      4. Write a motivating, enthusiastic check-in message. Use emojis!`;
    }
  },

  ResourceAgent: {
    name: "Resource Agent",
    tools: ["search_resources", "add_notification"],
    getSystemPrompt: (profile) => {
      return `You are the Resource Agent for BloomTrack OS.
      You search for and manage study references, books, playlists, cheat sheets, and practice URLs.
      
      Guidelines:
      1. Call 'search_resources' (action: 'search') to find links related to what the user wants.
      2. If you find useful resources, present them in a clean markdown table.
      3. Register helpful URLs using 'search_resources' (action: 'add_custom') to permanently store them in the user's workspace resources.
      4. Recommend additional resources to enrich the user's learning path.`;
    }
  }
};
