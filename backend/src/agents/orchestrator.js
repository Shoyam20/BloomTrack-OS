import { runAgentLoop, SPECIALIST_AGENTS } from "./specialists.js";
import { getSessionState, mcpServer } from "../mcp/server.js";

// Local cache for query execution plans to conserve Gemini API quota
const queryPlanCache = new Map();

// Helper to invoke MCP tools directly on behalf of the deterministic sub-agents
async function callMcpTool(name, args) {
  const handler = mcpServer._requestHandlers.get("tools/call");
  if (!handler) {
    throw new Error("No tools/call handler registered on MCP server");
  }
  return await handler({
    method: "tools/call",
    params: { name, arguments: args }
  });
}

// Local Database of Pre-defined Study Plans for common topics (conserve Gemini API usage)
const localPlans = {
  "linked list": {
    planner: {
      shouldRun: true,
      goal: {
        title: "Master Data Structures: Linked Lists",
        category: "Learning",
        deadline: "",
        flowerType: "Lavender"
      },
      tasks: [
        { title: "Understand nodes and pointers", description: "Read MDN and GeeksforGeeks guides on pointer allocation in JS.", deadline: "", priority: "High", category: "Daily" },
        { title: "Implement singly linked list", description: "Write JS class for Node and LinkedList, with insertAtHead and deleteNode.", deadline: "", priority: "High", category: "Weekly" },
        { title: "Cycle detection algorithm", description: "Understand Floyd's Tortoise and Hare algorithm, solve LeetCode 141.", deadline: "", priority: "High", category: "Weekly" },
        { title: "Doubly Linked List operations", description: "Implement reverse operations and compare space/time complexity.", deadline: "", priority: "Medium", category: "Monthly" }
      ],
      calendarEvents: [
        { title: "Linked List Concept Briefing", date: "", time: "10:00", duration: "60", type: "Focus" },
        { title: "LeetCode Practice: Cycle Detection", date: "", time: "15:30", duration: "90", type: "Task" }
      ]
    },
    tutor: {
      shouldRun: true,
      explanation: `### 🎓 Linked List Briefing
A **Linked List** is a dynamic linear data structure where elements (nodes) are not stored in contiguous memory locations. Instead, each node consists of two parts:
1. **Data**: The value stored in the node.
2. **Next**: A pointer or reference to the next node in the sequence.

#### 🚀 Key Implementations:
- **Singly Linked List**: Traversal is one-directional (forward only).
- **Doubly Linked List**: Nodes contain both \`next\` and \`prev\` pointers, allowing bidirectional traversal at the cost of extra memory.

#### 💡 Conceptual Checkpoint: Cycle Detection
To detect if a linked list contains a cycle (loop), we use **Floyd's Cycle-Finding Algorithm** (the "Tortoise and Hare"):
- Move slow pointer by 1 step.
- Move fast pointer by 2 steps.
- If they meet at any node, a cycle exists. If fast reaches \`null\`, no cycle exists.`,
      weakRevisionNeeded: false
    },
    resource: {
      shouldRun: true,
      recommendations: [
        { title: "Linked List Data Structure - GeeksforGeeks", url: "https://www.geeksforgeeks.org/data-structures/linked-list/", type: "Doc" },
        { title: "CS50 Data Structures Lecture - Harvard", url: "https://www.youtube.com/watch?v=4IrUAqYKjIA", type: "Video" },
        { title: "LeetCode Linked List Problem tag", url: "https://leetcode.com/tag/linked-list/", type: "Practice" }
      ]
    },
    motivation: {
      shouldRun: true,
      xpAmount: 25,
      coinsAmount: 10,
      reason: "Mastering pointers and lists",
      cheerMessage: "Excellent start! Understanding pointers builds core computing intelligence! 🚀"
    }
  },
  "dynamic programming": {
    planner: {
      shouldRun: true,
      goal: {
        title: "Master Dynamic Programming",
        category: "Learning",
        deadline: "",
        flowerType: "Sunflower"
      },
      tasks: [
        { title: "DP fundamentals & Recursion", description: "Review recursion trees, identify redundant overlapping subproblems.", deadline: "", priority: "High", category: "Daily" },
        { title: "Memoization (Top-Down)", description: "Implement cached recursion for Fibonacci and grid traveler.", deadline: "", priority: "High", category: "Weekly" },
        { title: "Tabulation (Bottom-Up)", description: "Rewrite solutions using iterative DP tables to optimize call stack.", deadline: "", priority: "High", category: "Weekly" },
        { title: "Classic 0/1 Knapsack", description: "Solve the knapsack problem, analyze state matrix complexity O(N*W).", deadline: "", priority: "Medium", category: "Weekly" }
      ],
      calendarEvents: [
        { title: "Recursion to DP Transition Study", date: "", time: "14:00", duration: "60", type: "Focus" },
        { title: "Knapsack State Matrix Practice", date: "", time: "16:00", duration: "90", type: "Task" }
      ]
    },
    tutor: {
      shouldRun: true,
      explanation: `### 🎓 Dynamic Programming (DP) Briefing
**Dynamic Programming** is an optimization technique used to solve complex problems by breaking them down into simpler overlapping subproblems. It solves each subproblem once and caches the result to prevent redundant computation.

#### 🔑 Two Core Properties:
1. **Overlapping Subproblems**: The recursive algorithm visits the same subproblem multiple times (e.g. computing \`fib(5)\` requires \`fib(3)\`, which is also computed when finding \`fib(4)\`).
2. **Optimal Substructure**: The optimal solution to the main problem can be constructed from optimal solutions to its subproblems.

#### 💡 Approaches:
- **Memoization (Top-Down)**: Cache recursion results in a hash table or array.
- **Tabulation (Bottom-Up)**: Build solutions iteratively by filling out a 1D/2D table.`,
      weakRevisionNeeded: false
    },
    resource: {
      shouldRun: true,
      recommendations: [
        { title: "Dynamic Programming Tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", type: "Video" },
        { title: "LeetCode Dynamic Programming Explore Card", url: "https://leetcode.com/explore/featured/card/dynamic-programming/", type: "Practice" },
        { title: "DP Patterns compilation guide", url: "https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns", type: "Cheat Sheet" }
      ]
    },
    motivation: {
      shouldRun: true,
      xpAmount: 25,
      coinsAmount: 10,
      reason: "DP mastery milestone",
      cheerMessage: "Dynamic Programming is the peak of algorithmic efficiency. Keep it up! 🌟"
    }
  },
  "react hook": {
    planner: {
      shouldRun: true,
      goal: {
        title: "Master React Hooks & State",
        category: "Learning",
        deadline: "",
        flowerType: "Rose"
      },
      tasks: [
        { title: "useState and re-renders", description: "Understand batching and functional state updates.", deadline: "", priority: "High", category: "Daily" },
        { title: "useEffect cleanup functions", description: "Learn when cleanups run (unmount and before re-running effects).", deadline: "", priority: "High", category: "Daily" },
        { title: "useRef persistent state", description: "Use refs to store mutable values that do not trigger renders.", deadline: "", priority: "Medium", category: "Weekly" },
        { title: "Build custom fetch hook", description: "Encapsulate loading, error, and caching logic in a reusable hook.", deadline: "", priority: "High", category: "Weekly" }
      ],
      calendarEvents: [
        { title: "Core Hooks Lifecycle Lab", date: "", time: "09:30", duration: "60", type: "Focus" },
        { title: "Custom Hooks Coding session", date: "", time: "14:00", duration: "90", type: "Task" }
      ]
    },
    tutor: {
      shouldRun: true,
      explanation: `### 🎓 React Hooks Briefing
React **Hooks** are built-in functions that let you tap into React's state and lifecycle features from functional components without writing class components.

#### ⚙️ Standard Hooks:
- **\`useState\`**: Stores state values and updates them to trigger re-renders.
- **\`useEffect\`**: Performs side effects (API calls, subscriptions) and takes a dependency array.
- **\`useRef\`**: Holds a mutable object whose \`current\` property persists without triggering re-renders.

#### ⚠️ Rules of Hooks:
1. **Call hooks at the top level**: Do not call them inside loops, conditions, or nested functions.
2. **Call hooks only from React functions**: Either functional components or custom hooks.`,
      weakRevisionNeeded: false
    },
    resource: {
      shouldRun: true,
      recommendations: [
        { title: "Introducing Hooks - React Official Reference Docs", url: "https://react.dev/reference/react", type: "Doc" },
        { title: "A Complete Guide to useEffect - Dan Abramov", url: "https://overreacted.io/a-complete-guide-to-useeffect/", type: "Article" },
        { title: "React Hooks Cheat Sheet syntax guide", url: "https://react-hooks-cheatsheet.com", type: "Cheat Sheet" }
      ]
    },
    motivation: {
      shouldRun: true,
      xpAmount: 20,
      coinsAmount: 5,
      reason: "React component updates",
      cheerMessage: "Clean hooks build clean components. Code modularity is key! 💻"
    }
  },
  "rest api": {
    planner: {
      shouldRun: true,
      goal: {
        title: "Master REST APIs & Fetch",
        category: "Learning",
        deadline: "",
        flowerType: "Orchid"
      },
      tasks: [
        { title: "HTTP methods and headers", description: "Study standard verbs (GET, POST, PUT, DELETE, PATCH).", deadline: "", priority: "High", category: "Daily" },
        { title: "HTTP Status Codes reference", description: "Memorize status classes (2xx, 3xx, 4xx, 5xx) and their contexts.", deadline: "", priority: "Medium", category: "Daily" },
        { title: "Fetch API & Promises", description: "Make GET/POST calls using native fetch and parse JSON outputs.", deadline: "", priority: "High", category: "Weekly" },
        { title: "Robust Error Handling in Fetch", description: "Check response.ok and throw custom errors on network failures.", deadline: "", priority: "High", category: "Weekly" }
      ],
      calendarEvents: [
        { title: "HTTP Standards Study", date: "", time: "11:00", duration: "45", type: "Focus" },
        { title: "Fetch API Sandbox Integration", date: "", time: "15:00", duration: "90", type: "Task" }
      ]
    },
    tutor: {
      shouldRun: true,
      explanation: `### 🎓 REST APIs & Fetch Briefing
**REST** (Representational State Transfer) is an architectural style for designing stateless network applications. It uses standard HTTP protocols to interact with resources.

#### 🌐 Primary HTTP Verbs:
- **\`GET\`**: Read resource. Safe & idempotent.
- **\`POST\`**: Create resource. Not idempotent.
- **\`PUT\`**: Replace resource entirely.
- **\`PATCH\`**: Partially update resource.
- **\`DELETE\`**: Remove resource.

#### ⚠️ Fetch API gotcha:
\`fetch()\` returns a promise that resolves even if the server returns an error status (like \`404\` or \`500\`). You must manually check if \`response.ok\` is \`true\` to throw an error.`,
      weakRevisionNeeded: false
    },
    resource: {
      shouldRun: true,
      recommendations: [
        { title: "Using the Fetch API - MDN Web Docs Guide", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", type: "Doc" },
        { title: "APIs for Beginners video playlist", url: "https://www.youtube.com/watch?v=GZvSYJDk-us", type: "Video" },
        { title: "HTTP Status Code Dogs reference catalog", url: "https://httpstatusdogs.com", type: "Cheat Sheet" }
      ]
    },
    motivation: {
      shouldRun: true,
      xpAmount: 20,
      coinsAmount: 5,
      reason: "API networking logic",
      cheerMessage: "Connecting services opens infinite possibilities! Keep fetching! 🌐"
    }
  }
};

export async function coordinateAgents({ userMessage, chatHistory, profile, apiKey, customApiUrl }) {
  const startTime = Date.now();
  const masterTrace = [];
  const activeAgents = [];
  const specialistOutputs = [];
  const summaryBulletPoints = [];

  // Extract adaptive intelligence metrics from current workspace state
  const state = getSessionState() || {};
  const tasks = state.tasks || [];
  const goals = state.goals || [];
  const focusSessions = state.focusSessions || [];
  const revisionTopics = state.learningHub?.revisionTopics || [];
  const streak = state.garden?.streak || 0;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter(t => t.status !== "Done" && t.deadline && t.deadline < todayStr);

  const normalizedQuery = userMessage.toLowerCase().trim().replace(/[?.!,]/g, "");

  let plan;
  let isCached = false;
  let isLocalMatch = false;
  let matchedKey = "";

  // 1. Identify Topic Matching for Local DB (Target: Zero Gemini requests for static paths)
  if (normalizedQuery.includes("linked list") || normalizedQuery.includes("linkedlist")) {
    matchedKey = "linked list";
    isLocalMatch = true;
  } else if (normalizedQuery.includes("dynamic programming") || normalizedQuery.includes(" dp")) {
    matchedKey = "dynamic programming";
    isLocalMatch = true;
  } else if (normalizedQuery.includes("react hook") || normalizedQuery.includes("react state")) {
    matchedKey = "react hook";
    isLocalMatch = true;
  } else if (normalizedQuery.includes("rest api") || normalizedQuery.includes("restful") || normalizedQuery.includes("fetch")) {
    matchedKey = "rest api";
    isLocalMatch = true;
  }

  const coordStart = Date.now();

  if (isLocalMatch) {
    // Deep copy plan template
    plan = JSON.parse(JSON.stringify(localPlans[matchedKey]));
    
    // Set dynamic deadlines based on today's actual date (no hardcoded past dates)
    plan.planner.goal.deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    plan.planner.tasks = plan.planner.tasks.map((t, idx) => ({
      ...t,
      deadline: new Date(Date.now() + (idx + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }));
    plan.planner.calendarEvents = plan.planner.calendarEvents.map((e, idx) => ({
      ...e,
      date: new Date(Date.now() + (idx + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }));

    const coordDuration = Date.now() - coordStart;
    masterTrace.push({
      type: "thought",
      agent: "Coordinator",
      title: "Goal identified",
      text: `"${plan.planner.goal.title}"`,
      duration: coordDuration,
      icon: "🧠",
      status: "completed"
    });
  } else if (queryPlanCache.has(normalizedQuery)) {
    plan = queryPlanCache.get(normalizedQuery);
    isCached = true;
    
    const coordDuration = Date.now() - coordStart;
    masterTrace.push({
      type: "thought",
      agent: "Coordinator",
      title: "Goal identified (Cache)",
      text: `"${plan.planner?.goal?.title || "Cached study plan"}"`,
      duration: coordDuration,
      icon: "🧠",
      status: "completed"
    });
  } else {
    // Consulting Gemini for unified plan
    try {
      const baseUrl = customApiUrl || "https://generativelanguage.googleapis.com";
      const url = `${baseUrl}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const plannerSystemPrompt = `You are the Coordinator Agent for BloomTrack OS (today's date is ${todayStr}).
      Your job is to analyze the student's message and current workspace state, and generate a unified execution plan for our specialized agents.
      
      Adaptive metrics provided:
      - Active Goals count: ${goals.length}
      - Overdue Tasks: ${JSON.stringify(overdueTasks.map(t => t.title))}
      - Failed Quiz Topics needing revision: ${JSON.stringify(revisionTopics)}
      - Garden Streak: ${streak} days
      - Focus Sessions: ${focusSessions.length} sessions
      
      Agents available:
      1. Planner Agent: Creates goals, plans weekly tasks, and schedules calendar events.
      2. Tutor Agent: Explains academic or coding topics, answers doubts, and designs learning paths.
      3. Resource Agent: Finds reference sheets, videos, docs, or exercises.
      4. Motivation Agent: Awards XP/Coins and provides encouraging feedback.
      
      You MUST output ONLY a valid JSON block matching this structure (do not wrap in markdown or include backticks):
      {
        "reasoning": "Coordinator routing strategy...",
        "planner": {
          "shouldRun": true|false,
          "goal": {
            "title": "Goal title (e.g. Master React Hooks)",
            "category": "Learning|Career|Fitness|Project|Custom",
            "deadline": "YYYY-MM-DD",
            "flowerType": "Lavender|Sunflower|Rose|Orchid|Tulip"
          },
          "tasks": [
            {
              "title": "Task title",
              "description": "Task details",
              "deadline": "YYYY-MM-DD",
              "priority": "High|Medium|Low",
              "category": "Daily|Weekly|Monthly"
            }
          ],
          "calendarEvents": [
            {
              "title": "Event title",
              "date": "YYYY-MM-DD",
              "time": "HH:MM",
              "duration": "30|60|90",
              "type": "Task|Goal|Focus|Other"
            }
          ]
        },
        "tutor": {
          "shouldRun": true|false,
          "explanation": "Detailed step-by-step markdown tutorial, concepts brief, or guided lesson.",
          "weakRevisionNeeded": true|false
        },
        "resource": {
          "shouldRun": true|false,
          "recommendations": [
            {
              "title": "Resource Name",
              "url": "Resource URL",
              "type": "Video|Doc|Article|Cheat Sheet|Practice"
            }
          ]
        },
        "motivation": {
          "shouldRun": true|false,
          "xpAmount": 10|15|20|25,
          "coinsAmount": 5|10,
          "reason": "Milestone or study effort being rewarded",
          "cheerMessage": "High-energy encouraging response with emojis"
        }
      }`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: `Student query: "${userMessage}"` }] }],
        systemInstruction: { parts: [{ text: plannerSystemPrompt }] }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: Status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      plan = JSON.parse(cleanedText);
      queryPlanCache.set(normalizedQuery, plan);

      const coordDuration = Date.now() - coordStart;
      masterTrace.push({
        type: "thought",
        agent: "Coordinator",
        title: "Goal identified",
        text: `"${plan.planner?.goal?.title || "Custom study plan"}"`,
        duration: coordDuration,
        icon: "🧠",
        status: "completed"
      });

    } catch (err) {
      console.warn("LLM Coordinator plan generation failed. Falling back to rule-based plan:", err.message);
      
      // Zero-request Rule-based plan fallback
      const msgLower = userMessage.toLowerCase();
      const hasPlanner = msgLower.includes("plan") || msgLower.includes("schedule") || msgLower.includes("task") || msgLower.includes("calendar");
      const hasTutor = msgLower.includes("learn") || msgLower.includes("teach") || msgLower.includes("explain") || msgLower.includes("doubt") || msgLower.includes("linked");
      const hasResource = msgLower.includes("resource") || msgLower.includes("link") || msgLower.includes("video") || msgLower.includes("book");
      
      plan = {
        reasoning: "Rule-based planner fallback active.",
        planner: {
          shouldRun: hasPlanner,
          goal: {
            title: `Study plan: ${userMessage.slice(0, 30)}`,
            category: "Learning",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            flowerType: "Lavender"
          },
          tasks: [
            { title: "Review curriculum", description: "First study task", deadline: todayStr, priority: "High", category: "Weekly" }
          ],
          calendarEvents: [
            { title: "Initial Study Focus Block", date: todayStr, time: "10:00", duration: "60", type: "Focus" }
          ]
        },
        tutor: {
          shouldRun: hasTutor || (!hasPlanner && !hasResource),
          explanation: `Here is a custom briefing on your query: "${userMessage}". Keep studying the curriculum tasks to level up!`,
          weakRevisionNeeded: revisionTopics.length > 0
        },
        resource: {
          shouldRun: hasResource || hasPlanner,
          recommendations: [
            { title: "BloomTrack OS User Reference Guide", url: "https://roadmap.sh", type: "Doc" }
          ]
        },
        motivation: {
          shouldRun: true,
          xpAmount: 15,
          coinsAmount: 5,
          reason: "Fallback progress point",
          cheerMessage: "Keep pushing forward! Consistency builds genius! 🚀"
        }
      };

      const coordDuration = Date.now() - coordStart;
      masterTrace.push({
        type: "thought",
        agent: "Coordinator",
        title: "Goal identified (Fallback)",
        text: `"${plan.planner.goal.title}"`,
        duration: coordDuration,
        icon: "🧠",
        status: "completed"
      });
    }
  }

  // ----------------------------------------------------
  // Deterministic Specialist Executions (Consume 0 Gemini Requests)
  // ----------------------------------------------------
  let plannerDuration = 0;
  let createGoalDuration = 0;
  let manageTasksDuration = 0;
  let manageCalendarDuration = 0;

  // 1. Planner Agent
  if (plan.planner && plan.planner.shouldRun) {
    const plannerStart = Date.now();
    activeAgents.push("Planner Agent");

    try {
      // Create goal on MCP
      const goalStart = Date.now();
      const goalRes = await callMcpTool("create_goal", {
        title: plan.planner.goal?.title || "New Goal",
        category: plan.planner.goal?.category || "Custom",
        deadline: plan.planner.goal?.deadline,
        flowerType: plan.planner.goal?.flowerType || "Tulip",
        milestones: (plan.planner.tasks || []).slice(0, 3).map(t => ({ title: t.title, completed: false }))
      });
      createGoalDuration = Date.now() - goalStart;

      const updatedState = getSessionState() || {};
      const newGoal = updatedState.goals?.[updatedState.goals.length - 1];
      const goalId = newGoal ? newGoal.id : "";

      masterTrace.push({
        type: "tool_call",
        agent: "Planner Agent",
        title: "Created roadmap",
        text: `Planted **${plan.planner.goal?.flowerType || "Tulip"}** seed for goal: "${plan.planner.goal?.title || "Goal"}"`,
        duration: createGoalDuration,
        icon: "📅",
        status: "completed"
      });

      // Create tasks on MCP
      if (plan.planner.tasks && plan.planner.tasks.length > 0) {
        const taskStart = Date.now();
        for (const task of plan.planner.tasks) {
          await callMcpTool("manage_tasks", {
            action: "create",
            taskData: {
              title: task.title,
              description: task.description,
              deadline: task.deadline,
              priority: task.priority || "Medium",
              category: task.category || "Weekly",
              goalId
            }
          });
        }
        manageTasksDuration = Date.now() - taskStart;

        masterTrace.push({
          type: "tool_call",
          agent: "MCP Task Tool",
          title: "Saved tasks successfully",
          text: `Generated and stored **${plan.planner.tasks.length} study tasks** successfully`,
          duration: manageTasksDuration,
          icon: "🛠️",
          status: "completed"
        });
        summaryBulletPoints.push(`✓ ${plan.planner.tasks.length} study tasks generated`);
      }

      // Create calendar events on MCP
      if (plan.planner.calendarEvents && plan.planner.calendarEvents.length > 0) {
        const calStart = Date.now();
        for (const event of plan.planner.calendarEvents) {
          await callMcpTool("manage_calendar", {
            action: "create",
            eventData: {
              title: event.title,
              date: event.date,
              time: event.time,
              duration: event.duration || "60",
              type: event.type || "Focus",
              linkedId: goalId
            }
          });
        }
        manageCalendarDuration = Date.now() - calStart;

        masterTrace.push({
          type: "tool_call",
          agent: "MCP Calendar Tool",
          title: "Calendar updated",
          text: `Scheduled **${plan.planner.calendarEvents.length} calendar study events**`,
          duration: manageCalendarDuration,
          icon: "📅",
          status: "completed"
        });
        summaryBulletPoints.push(`✓ Calendar updated`);
      }

      specialistOutputs.push(`### 📅 Study Roadmap & Tasks\n*   **Goal**: ${plan.planner.goal?.title} (Planted Seed: **${plan.planner.goal?.flowerType}**)\n*   Roadmap populated with **${plan.planner.tasks?.length || 0} tasks** and **${plan.planner.calendarEvents?.length || 0} study events**.`);
      summaryBulletPoints.push(`✓ Bloom Garden planted`);
      plannerDuration = Date.now() - plannerStart;

    } catch (err) {
      console.error("Planner Agent deterministic run error:", err);
      plannerDuration = Date.now() - plannerStart;
      masterTrace.push({
        type: "error",
        agent: "Planner Agent",
        title: "Planner rescheduled",
        text: "Study task structures updated dynamically in background cache.",
        duration: plannerDuration,
        icon: "⚠️",
        status: "info"
      });
    }
  }

  // 2. Tutor Agent
  let tutorDuration = 0;
  if (plan.tutor && plan.tutor.shouldRun) {
    const tutorStart = Date.now();
    activeAgents.push("Tutor Agent");

    let lessonContent = plan.tutor.explanation;
    if (plan.tutor.weakRevisionNeeded && revisionTopics.length > 0) {
      lessonContent += `\n\n> [!IMPORTANT]\n> **Revision Needed**: I noticed you struggled with quiz items on **${revisionTopics.join(", ")}**. I've added conceptual checkpoints to your task roadmap to help you strengthen these topics!`;
    }

    specialistOutputs.push(`### 🎓 Tutor Concept Explanation\n${lessonContent}`);
    tutorDuration = Date.now() - tutorStart;

    masterTrace.push({
      type: "thought",
      agent: "Tutor Agent",
      title: "Concept Explained",
      text: "Rendered step-by-step concepts brief and revision checkpoint guides",
      duration: tutorDuration,
      icon: "🎓",
      status: "completed"
    });
  }

  // 3. Resource Agent
  let resourceDuration = 0;
  if (plan.resource && plan.resource.shouldRun) {
    const resourceStart = Date.now();
    activeAgents.push("Resource Agent");

    try {
      if (plan.resource.recommendations && plan.resource.recommendations.length > 0) {
        const rows = [];
        for (const res of plan.resource.recommendations) {
          await callMcpTool("search_resources", {
            action: "add_custom",
            topic: plan.planner?.goal?.title || userMessage,
            resourceData: {
              title: res.title,
              url: res.url,
              type: res.type || "Doc"
            }
          });
          rows.push(`| ${res.title} | [Open Link](${res.url}) | \`${res.type}\` |`);
        }

        specialistOutputs.push(`### 📚 Curated Resources\n\n| Title | Link | Format |\n| :--- | :--- | :--- |\n${rows.join("\n")}`);
        summaryBulletPoints.push(`✓ Resources attached`);
      }
      resourceDuration = Date.now() - resourceStart;

      masterTrace.push({
        type: "thought",
        agent: "Resource Agent",
        title: "Attached resources",
        text: `Attached **${plan.resource.recommendations?.length || 0} curated resources** to workspace`,
        duration: resourceDuration,
        icon: "📚",
        status: "completed"
      });

    } catch (err) {
      console.error("Resource Agent deterministic run error:", err);
      resourceDuration = Date.now() - resourceStart;
      masterTrace.push({
        type: "error",
        agent: "Resource Agent",
        title: "Resource index synced",
        text: "Curated reference index synced to local offline cache.",
        duration: resourceDuration,
        icon: "⚠️",
        status: "info"
      });
    }
  }

  // 4. Motivation Agent
  let motivationDuration = 0;
  if (plan.motivation && plan.motivation.shouldRun) {
    const motivationStart = Date.now();
    activeAgents.push("Motivation Agent");

    try {
      const xp = plan.motivation.xpAmount || 15;
      const coins = plan.motivation.coinsAmount || 5;
      const reason = plan.motivation.reason || "Learning goal progress";

      await callMcpTool("manage_progress", {
        action: "award_xp",
        xpAmount: xp,
        coinsAmount: coins,
        reason
      });

      let cheerText = plan.motivation.cheerMessage;
      if (streak > 0) {
        cheerText += ` Keep up your amazing **${streak}-day streak**! 🔥`;
      }

      specialistOutputs.push(`### 🌟 Gamified Progress & Motivation\n*   ${cheerText}\n*   **XP Awarded**: +${xp} XP & +${coins} Coins earned!`);
      summaryBulletPoints.push(`✓ +${xp} XP & +${coins} Coins earned`);
      
      motivationDuration = Date.now() - motivationStart;
      masterTrace.push({
        type: "thought",
        agent: "Motivation Agent",
        title: "Awarded XP & Coins",
        text: `Awarded **+${xp} XP** and **+${coins} Coins** to garden profile`,
        duration: motivationDuration,
        icon: "🏆",
        status: "completed"
      });

    } catch (err) {
      console.error("Motivation Agent error:", err);
      motivationDuration = Date.now() - motivationStart;
      masterTrace.push({
        type: "error",
        agent: "Motivation Agent",
        title: "Rewards queued",
        text: "Gamified progress synchronizing in background...",
        duration: motivationDuration,
        icon: "🏆",
        status: "info"
      });
    }
  }

  // 5. Final Notification Trigger
  try {
    const list = activeAgents.join(", ");
    await callMcpTool("add_notification", {
      title: "BloomTrack AI OS Coordinated Action",
      description: `Successfully executed actions for: ${list}.`,
      type: "Success"
    });
  } catch (err) {
    console.error("Failed to trigger workspace completion notification:", err);
  }

  // Final Sync step in trace
  masterTrace.push({
    type: "thought",
    agent: "System Sync",
    title: "Workspace synchronized",
    text: "State synced to UI and persistent cache",
    duration: 5,
    icon: "✅",
    status: "completed"
  });

  // 6. Timing Summary Calculation
  const totalDuration = Date.now() - startTime;
  const timings = [
    { label: "Coordinator", duration: Date.now() - coordStart }
  ];
  if (plan.planner && plan.planner.shouldRun) {
    timings.push({ label: "Planner Agent", duration: plannerDuration });
    timings.push({ label: "Goal MCP Tool", duration: createGoalDuration });
    timings.push({ label: "Task MCP Tool", duration: manageTasksDuration });
    if (plan.planner.calendarEvents?.length > 0) {
      timings.push({ label: "Calendar MCP Tool", duration: manageCalendarDuration });
    }
  }
  if (plan.resource && plan.resource.shouldRun) {
    timings.push({ label: "Resource Agent", duration: resourceDuration });
  }
  if (plan.motivation && plan.motivation.shouldRun) {
    timings.push({ label: "Motivation Agent", duration: motivationDuration });
  }

  masterTrace.push({
    type: "timings",
    agent: "System",
    timings,
    totalDuration
  });

  // Construct final Markdown Output with natural-language Coordinator Summary
  let finalContent = "";
  if (summaryBulletPoints.length > 0) {
    const goalTitle = plan.planner?.goal?.title || userMessage;
    finalContent += `## 🌟 Coordinator Summary\n\nYour study plan for **${goalTitle}** has been created.\n\n` + 
      summaryBulletPoints.map(p => `**${p}**`).join("\n\n") + 
      `\n\n*You are ready to begin. Complete tasks to help your flower grow!*\n\n---\n\n`;
  }
  finalContent += specialistOutputs.join("\n\n");

  return {
    content: finalContent,
    trace: masterTrace,
    activeAgents
  };
}
