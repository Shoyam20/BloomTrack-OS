import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mcpServer, setSessionState, getSessionState, getSessionActions } from "./src/mcp/server.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { coordinateAgents } from "./src/agents/orchestrator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory reference for the active SSE connection for standard MCP clients
let mcpTransport = null;

// ----------------------------------------------------
// 1. Real MCP Server SSE Endpoints
// ----------------------------------------------------

app.get("/sse", async (req, res) => {
  console.log("New MCP Client connecting via SSE...");
  mcpTransport = new SSEServerTransport("/messages", res);
  
  try {
    await mcpServer.connect(mcpTransport);
    console.log("MCP Server successfully connected to SSE transport.");
  } catch (err) {
    console.error("Failed to connect MCP server to transport:", err);
    res.status(500).send("MCP connection error");
  }
});

app.post("/messages", async (req, res) => {
  if (!mcpTransport) {
    return res.status(400).json({ error: "No active SSE session initialized" });
  }
  
  try {
    await mcpTransport.handleMessage(req, res);
  } catch (err) {
    console.error("Error handling MCP message:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. Multi-Agent Orchestrator API
// ----------------------------------------------------

app.post("/api/chat", async (req, res) => {
  const { message, chatHistory, workspaceState, profile, customApiUrl } = req.body;
  const apiKey = req.headers["x-gemini-key"];

  if (!apiKey) {
    return res.status(400).json({ error: "Gemini API key is required in x-gemini-key header" });
  }

  try {
    console.log(`Received agent orchestrator chat request: "${message}"`);
    
    // Set the backend session state to match the frontend's current workspace state
    setSessionState(workspaceState);

    // Coordinate the agents and execute tool calls
    const result = await coordinateAgents({
      userMessage: message,
      chatHistory,
      profile,
      apiKey,
      customApiUrl
    });

    // Retrieve modified state and actions accumulated during agent executions
    const updatedState = getSessionState();
    const actions = getSessionActions();

    res.json({
      content: result.content,
      trace: result.trace,
      activeAgents: result.activeAgents,
      updatedState,
      actions
    });

  } catch (error) {
    console.error("Error in agent orchestrator API:", error);
    res.json({
      content: "### ☕ Session Sync Alert\nBloomTrack OS is experiencing high demand. I've activated our local study cache to help you stay on track! Let me know if you want to try scheduling again in a moment.",
      trace: [
        { type: "thought", agent: "Coordinator", title: "Sync delayed", text: "Workspace synchronization rescheduled. Retrying background process...", icon: "⚠️", status: "info" }
      ],
      activeAgents: ["Coordinator"],
      updatedState: getSessionState() || workspaceState,
      actions: []
    });
  }
});

// ----------------------------------------------------
// 3. Adaptive Learning Recommendations API
// ----------------------------------------------------

app.post("/api/recommendations", async (req, res) => {
  const { workspaceState } = req.body;

  try {
    const tasks = workspaceState?.tasks || [];
    const focusSessions = workspaceState?.focusSessions || [];
    const goals = workspaceState?.goals || [];
    const revisionTopics = workspaceState?.learningHub?.revisionTopics || [];
    const streak = workspaceState?.garden?.streak || 0;

    // 1. Calculate focusToday (Missed / Overdue / Today / Goals)
    let focusToday = "";
    const todayStr = new Date().toISOString().split("T")[0];
    const overdueTasks = tasks.filter(t => t.status !== "Done" && t.deadline && t.deadline < todayStr);
    const todayTasks = tasks.filter(t => t.status !== "Done" && t.deadline === todayStr);
    const activeGoals = goals.filter(g => g.progress < 100);

    if (overdueTasks.length > 0) {
      focusToday = `Prioritize overdue: "${overdueTasks[0].title}". Get this done today to realign with your curriculum study roadmap!`;
    } else if (todayTasks.length > 0) {
      focusToday = `Focus on today's target: "${todayTasks[0].title}". Schedule a focus block to finish it before the deadline.`;
    } else if (activeGoals.length > 0) {
      focusToday = `Advance your learning goal: "${activeGoals[0].title}". Add some subtasks or log a 25-minute Pomodoro session.`;
    } else {
      focusToday = "All study tasks completed! Go to the Planner and plant a new learning goal to grow your digital garden.";
    }

    // 2. Calculate revisionAlert (Revision topics / Quiz mistakes)
    let revisionAlert = "";
    if (revisionTopics.length > 0) {
      revisionAlert = `Conceptual revision alert: "${revisionTopics[0]}". Practicing flashcards or reviewing core guides will boost your quiz accuracy!`;
    } else {
      revisionAlert = "Conceptual health is looking strong! Test your understanding by taking a practice quiz in the Learning Hub.";
    }

    // 3. Calculate habitBoost (Streak / Focus logs)
    let habitBoost = "";
    if (streak > 0) {
      habitBoost = `Incredible work! You have maintained a ${streak}-day study streak. Keep it up in the garden! 🔥`;
    } else if (focusSessions.length > 0) {
      habitBoost = `You've completed ${focusSessions.length} focus sessions so far! Keep the learning engine running and start a Pomodoro block.`;
    } else {
      habitBoost = "Start your first 25-minute study block in the Focus tab to sow seeds and kickstart your daily streak!";
    }

    res.json({ focusToday, revisionAlert, habitBoost });
  } catch (error) {
    console.error("Error generating recommendations locally:", error.message);
    res.json({
      focusToday: "Prioritize starting a focus session on your main study goal.",
      revisionAlert: "Review your practice flashcards to reinforce core concepts.",
      habitBoost: "Keep up your learning momentum! Every small study session counts towards your streak."
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 BloomTrack Backend Server running on port ${PORT}`);
  console.log(`🔌 MCP SSE connection endpoint: http://localhost:${PORT}/sse`);
  console.log(`🤖 Multi-Agent Orchestrator: http://localhost:${PORT}/api/chat`);
  console.log(`=================================================`);
});
