import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Keep in-memory reference to the current active session state
let sessionState = {
  tasks: [],
  goals: [],
  calendarEvents: [],
  garden: { xp: 0, coins: 0, level: 1, streak: 0, timeline: [], achievements: [] },
  customResources: {},
  notifications: [],
  profile: null
};

// Queue of action effects to apply on frontend
let sessionActions = [];

export function getSessionState() {
  return sessionState;
}

export function setSessionState(newState) {
  sessionState = {
    tasks: newState.tasks || [],
    goals: newState.goals || [],
    calendarEvents: newState.calendarEvents || [],
    garden: newState.garden || { xp: 0, coins: 0, level: 1, streak: 0, timeline: [], achievements: [] },
    customResources: newState.customResources || {},
    notifications: newState.notifications || [],
    profile: newState.profile || null
  };
  sessionActions = [];
}

export function getSessionActions() {
  return sessionActions;
}

// Curated static resources list (same as frontend for high-fidelity)
const curatedResources = {
  "data structures: linked lists": [
    { title: "Linked List Data Structure - GeeksforGeeks", type: "Doc", url: "https://www.geeksforgeeks.org/data-structures/linked-list/", description: "A comprehensive guide on singly, doubly, and circular linked lists with code implementations." },
    { title: "CS50 Data Structures Lecture - Harvard", type: "Video", url: "https://www.youtube.com/watch?v=4IrUAqYKjIA", description: "Harvard's CS50 explanation of dynamic memory allocation, pointers, and building linked lists." },
    { title: "Visualizing Linked List Operations", type: "Article", url: "https://visualgo.net/en/list", description: "Interactive animations showing insertions, deletions, and search operations in real-time." }
  ],
  "dynamic programming": [
    { title: "Dynamic Programming Tutorial - freeCodeCamp", type: "Video", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", description: "A legendary 5-hour video course covering memoization, tabulating, and standard DP challenges." },
    { title: "Demystifying Dynamic Programming", type: "Article", url: "https://medium.freecodecamp.org/demystifying-dynamic-programming-3ee3081e7d0f", description: "A clear, intuitive breakdown of how to identify DP problems and state transitions." },
    { title: "DP Patterns Cheat Sheet", type: "Cheat Sheet", url: "https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns", description: "Famous compilation of DP patterns (knapsack, interval, grid, partition) with templates." }
  ],
  "react hooks & state": [
    { title: "Introducing Hooks - Official React Docs", type: "Doc", url: "https://react.dev/reference/react", description: "Official documentation covering useState, useEffect, useContext, and custom Hook rules." },
    { title: "React Hooks Course - Web Dev Simplified", type: "Video", url: "https://www.youtube.com/watch?v=O6P86uwfdR0", description: "Comprehensive video review of all common React hooks with practical code examples." },
    { title: "React Hooks Cheat Sheet", type: "Cheat Sheet", url: "https://react-hooks-cheatsheet.com", description: "A clean reference guide with code snippets showing syntax and best practices for every hook." }
  ],
  "rest apis & fetch": [
    { title: "Using the Fetch API - MDN Web Docs", type: "Doc", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", description: "Standard Web APIs guide to making HTTP network requests in Javascript." },
    { title: "REST API Tutorial - Codecademy", type: "Article", url: "https://www.codecademy.com/articles/what-is-rest", description: "Conceptual guide to REST architectural style, endpoints, headers, and request methods." }
  ]
};

// Initialize MCP Server
export const mcpServer = new Server(
  {
    name: "bloomtrack-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tool Definitions
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "manage_calendar",
        description: "Manage the study calendar and schedule. Use this to schedule events, focus blocks, or review sessions.",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list", "create", "delete"], description: "The action to perform." },
            eventData: {
              type: "object",
              properties: {
                title: { type: "string", description: "Title of the calendar event." },
                date: { type: "string", description: "Event date in YYYY-MM-DD format." },
                time: { type: "string", description: "Time of day in HH:MM format." },
                duration: { type: "string", description: "Duration in minutes (e.g. '30', '60', '90')." },
                type: { type: "string", enum: ["Task", "Goal", "Focus", "Other"], description: "Type of event block." },
                linkedId: { type: "string", description: "Optional reference ID to a task or goal." }
              },
              required: ["title", "date", "time"]
            },
            eventId: { type: "string", description: "The ID of the event to delete." }
          },
          required: ["action"]
        }
      },
      {
        name: "search_resources",
        description: "Find study materials, cheat sheets, tutorials, or video links for a topic, or record custom study resources.",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["search", "add_custom"], description: "The action to perform." },
            topic: { type: "string", description: "The learning topic (e.g. 'Dynamic Programming', 'React Hooks & State')." },
            resourceData: {
              type: "object",
              properties: {
                title: { type: "string", description: "Title of the resource." },
                url: { type: "string", description: "Valid URL of the resource." },
                type: { type: "string", enum: ["Video", "Doc", "Article", "Cheat Sheet", "Practice"], description: "Resource format." }
              },
              required: ["title", "url", "type"]
            }
          },
          required: ["action", "topic"]
        }
      },
      {
        name: "manage_tasks",
        description: "Manage tasks in the workspace. Add new tasks, update their status, list them, or delete them.",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list", "create", "update_status", "delete"], description: "The action to perform." },
            taskData: {
              type: "object",
              properties: {
                title: { type: "string", description: "Title of the task." },
                description: { type: "string", description: "Detailed task description." },
                deadline: { type: "string", description: "Deadline date in YYYY-MM-DD format." },
                priority: { type: "string", enum: ["High", "Medium", "Low"], description: "Priority level." },
                category: { type: "string", enum: ["Daily", "Weekly", "Monthly"], description: "Task category tab." },
                goalId: { type: "string", description: "Optional goal ID this task is linked to." }
              },
              required: ["title"]
            },
            taskId: { type: "string", description: "ID of the task to update or delete." },
            status: { type: "string", enum: ["To Do", "In Progress", "Done"], description: "New status of the task." }
          },
          required: ["action"]
        }
      },
      {
        name: "manage_progress",
        description: "Fetch user stats, update goal progress, or award XP and coins for studying, solving problems, or hitting milestones.",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["get_stats", "award_xp", "update_goal_progress"], description: "The action to perform." },
            goalId: { type: "string", description: "ID of the goal to update." },
            progressPercent: { type: "integer", minimum: 0, maximum: 100, description: "New progress percentage." },
            xpAmount: { type: "integer", description: "Amount of XP to award (e.g. 15, 25)." },
            coinsAmount: { type: "integer", description: "Amount of Coins to award (e.g. 5, 10)." },
            reason: { type: "string", description: "Reason for the award (logs to the garden timeline)." }
          },
          required: ["action"]
        }
      },
      {
        name: "create_goal",
        description: "Create a main study goal in the workspace with milestones.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "The title of the goal." },
            category: { type: "string", enum: ["Learning", "Career", "Fitness", "Project", "Custom"], description: "The category." },
            deadline: { type: "string", description: "Goal deadline date in YYYY-MM-DD format." },
            flowerType: { type: "string", enum: ["Lavender", "Sunflower", "Rose", "Orchid", "Tulip"], description: "Flower type representing this goal in the garden." },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  completed: { type: "boolean" }
                },
                required: ["title"]
              },
              description: "Goal milestones list."
            }
          },
          required: ["title"]
        }
      },
      {
        name: "add_notification",
        description: "Create a workspace notification to inform the user about actions.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the notification." },
            description: { type: "string", description: "Details of the notification." },
            type: { type: "string", enum: ["Info", "Warning", "Success"], description: "Notification severity type." }
          },
          required: ["title"]
        }
      }
    ]
  };
});

// Handle Tool Call Execution
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "manage_calendar": {
        const { action, eventData, eventId } = args;
        if (action === "list") {
          return { content: [{ type: "text", text: JSON.stringify(sessionState.calendarEvents, null, 2) }] };
        }
        if (action === "create") {
          const id = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newEvent = { id, ...eventData };
          sessionState.calendarEvents.push(newEvent);
          sessionActions.push({ type: "schedule_event", data: newEvent });
          return { content: [{ type: "text", text: `Calendar event created: "${newEvent.title}" on ${newEvent.date} at ${newEvent.time}.` }] };
        }
        if (action === "delete") {
          sessionState.calendarEvents = sessionState.calendarEvents.filter(e => e.id !== eventId);
          sessionActions.push({ type: "delete_event", id: eventId });
          return { content: [{ type: "text", text: `Calendar event with ID ${eventId} has been deleted.` }] };
        }
        throw new Error(`Unsupported calendar action: ${action}`);
      }

      case "search_resources": {
        const { action, topic, resourceData } = args;
        const normTopic = topic.toLowerCase().trim();

        if (action === "search") {
          let found = curatedResources[normTopic] || [];
          const custom = sessionState.customResources[normTopic] || [];
          const allRes = [...found, ...custom];
          if (allRes.length === 0) {
            return {
              content: [{
                type: "text",
                text: `No curated resources found for "${topic}". Try searching web links or adding a custom resource.`
              }]
            };
          }
          return { content: [{ type: "text", text: JSON.stringify(allRes, null, 2) }] };
        }

        if (action === "add_custom") {
          if (!sessionState.customResources[normTopic]) {
            sessionState.customResources[normTopic] = [];
          }
          const id = `custom-res-${Date.now()}`;
          const newRes = { id, ...resourceData };
          sessionState.customResources[normTopic].push(newRes);
          sessionActions.push({ type: "add_custom_resource", topic, data: newRes });
          return { content: [{ type: "text", text: `Custom study resource added successfully to topic "${topic}": "${newRes.title}".` }] };
        }
        throw new Error(`Unsupported resources action: ${action}`);
      }

      case "manage_tasks": {
        const { action, taskData, taskId, status } = args;
        if (action === "list") {
          return { content: [{ type: "text", text: JSON.stringify(sessionState.tasks, null, 2) }] };
        }
        if (action === "create") {
          const id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newTask = {
            id,
            title: taskData.title,
            description: taskData.description || "",
            deadline: taskData.deadline || new Date().toISOString().split("T")[0],
            priority: taskData.priority || "Medium",
            category: taskData.category || "Daily",
            status: "To Do",
            goalId: taskData.goalId || "",
            completedCount: 0,
            createdAt: new Date().toISOString()
          };
          sessionState.tasks.push(newTask);
          sessionActions.push({ type: "create_task", data: newTask });
          return { content: [{ type: "text", text: `Task created successfully: "${newTask.title}" (Priority: ${newTask.priority}, Deadline: ${newTask.deadline}).` }] };
        }
        if (action === "update_status") {
          sessionState.tasks = sessionState.tasks.map(t => t.id === taskId ? { ...t, status } : t);
          sessionActions.push({ type: "update_task", id: taskId, status });
          return { content: [{ type: "text", text: `Task ID ${taskId} status updated to: "${status}".` }] };
        }
        if (action === "delete") {
          sessionState.tasks = sessionState.tasks.filter(t => t.id !== taskId);
          sessionActions.push({ type: "delete_task", id: taskId });
          return { content: [{ type: "text", text: `Task ID ${taskId} has been deleted.` }] };
        }
        throw new Error(`Unsupported task action: ${action}`);
      }

      case "manage_progress": {
        const { action, goalId, progressPercent, xpAmount, coinsAmount, reason } = args;

        if (action === "get_stats") {
          const totalTasks = sessionState.tasks.length;
          const completedTasks = sessionState.tasks.filter(t => t.status === "Done").length;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          const stats = {
            xp: sessionState.garden.xp,
            level: sessionState.garden.level,
            coins: sessionState.garden.coins,
            streak: sessionState.garden.streak,
            totalTasks,
            completedTasks,
            completionRate,
            goals: sessionState.goals.map(g => ({ id: g.id, title: g.title, progress: g.progress }))
          };
          return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
        }

        if (action === "update_goal_progress") {
          sessionState.goals = sessionState.goals.map(g => g.id === goalId ? { ...g, progress: progressPercent } : g);
          sessionActions.push({ type: "update_goal_progress", id: goalId, progress: progressPercent });
          return { content: [{ type: "text", text: `Goal ID ${goalId} progress updated to ${progressPercent}%.` }] };
        }

        if (action === "award_xp") {
          const xp = xpAmount || 10;
          const coins = coinsAmount || 5;
          const desc = reason || "Completed a study session";

          const nextXp = sessionState.garden.xp + xp;
          const nextCoins = sessionState.garden.coins + coins;
          const nextLevel = Math.floor(nextXp / 100) + 1;
          const leveledUp = nextLevel > sessionState.garden.level;

          sessionState.garden.xp = nextXp;
          sessionState.garden.coins = nextCoins;
          sessionState.garden.level = nextLevel;

          const timelineEvent = {
            id: `time-${Date.now()}`,
            text: `Earned +${xp} XP & +${coins} Coins: ${desc}`,
            timestamp: new Date().toISOString(),
            xp
          };
          sessionState.garden.timeline.unshift(timelineEvent);

          sessionActions.push({ type: "award_xp", xp, coins, reason: desc, leveledUp, nextLevel });

          let responseText = `Awarded +${xp} XP and +${coins} Coins. Current Level: ${nextLevel}. Reason: "${desc}".`;
          if (leveledUp) {
            responseText += `\n🎉 LEVEL UP! The user leveled up to Level ${nextLevel}!`;
          }
          return { content: [{ type: "text", text: responseText }] };
        }
        throw new Error(`Unsupported progress action: ${action}`);
      }

      case "create_goal": {
        const id = `goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newGoal = {
          id,
          title: args.title,
          category: args.category || "Custom",
          deadline: args.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          flowerType: args.flowerType || "Tulip",
          progress: 0,
          milestones: args.milestones || [],
          description: args.description || "",
          hoursPerWeek: args.hoursPerWeek || 0,
          generationStatus: "success",
          generationError: null,
          completed: false,
          createdAt: new Date().toISOString()
        };
        sessionState.goals.push(newGoal);
        sessionActions.push({ type: "create_goal", data: newGoal });
        return { content: [{ type: "text", text: `Main goal created successfully: "${newGoal.title}" (Flower: ${newGoal.flowerType}, Category: ${newGoal.category}).` }] };
      }

      case "add_notification": {
        const id = `noti-${Date.now()}`;
        const newNoti = {
          id,
          title: args.title,
          description: args.description || "",
          type: args.type || "Info",
          read: false,
          createdAt: new Date().toISOString()
        };
        sessionState.notifications.unshift(newNoti);
        sessionActions.push({ type: "add_notification", data: newNoti });
        return { content: [{ type: "text", text: `Notification added: "${newNoti.title}".` }] };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error executing tool ${name}: ${error.message}` }]
    };
  }
});
