import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable, documentsTable, deadlinesTable, tasksTable, interactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  const [cases, documents, deadlines, tasks, interactions] = await Promise.all([
    db.select().from(casesTable),
    db.select().from(documentsTable),
    db.select().from(deadlinesTable).orderBy(deadlinesTable.date),
    db.select().from(tasksTable),
    db.select().from(interactionsTable).orderBy(interactionsTable.date),
  ]);

  const activeCases = cases.filter(c => c.status === "Active").length;
  const pendingCases = cases.filter(c => c.status === "Pending").length;
  const highPriorityDeadlines = deadlines.filter(d => d.priority === "High").length;
  const openTasks = tasks.filter(t => t.status === "Open").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;

  // Build a recent activity feed from docs, deadlines, tasks, interactions
  const caseMap = new Map(cases.map(c => [c.id, c.name]));

  type ActivityItem = { type: string; description: string; caseName: string; date: string };
  const activity: ActivityItem[] = [];

  for (const d of documents.slice(-5)) {
    activity.push({ type: "document", description: `Document added: ${d.name}`, caseName: caseMap.get(d.caseId) ?? "Unknown", date: d.createdAt.toISOString() });
  }
  for (const t of tasks.slice(-5)) {
    activity.push({ type: "task", description: `Task ${t.status === "Completed" ? "completed" : "created"}: ${t.title}`, caseName: caseMap.get(t.caseId) ?? "Unknown", date: t.createdAt.toISOString() });
  }
  for (const i of interactions.slice(-5)) {
    activity.push({ type: "interaction", description: `${i.type} with ${i.client}`, caseName: caseMap.get(i.caseId) ?? "Unknown", date: i.createdAt.toISOString() });
  }

  // Sort by date descending
  activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    totalCases: cases.length,
    activeCases,
    pendingCases,
    upcomingDeadlines: deadlines.length,
    highPriorityDeadlines,
    openTasks,
    inProgressTasks,
    totalDocuments: documents.length,
    totalInteractions: interactions.length,
    recentActivity: activity.slice(0, 10),
  });
});

export default router;
