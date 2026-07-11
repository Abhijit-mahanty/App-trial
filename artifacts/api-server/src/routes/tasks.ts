import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const taskInputSchema = z.object({
  title: z.string().min(1),
  caseId: z.number().int(),
  assignee: z.string(),
  status: z.enum(["Open", "In Progress", "Completed"]).optional().default("Open"),
  dueDate: z.string(),
});

const taskUpdateSchema = taskInputSchema.partial();

function formatTask(t: typeof tasksTable.$inferSelect) {
  return {
    id: t.id,
    title: t.title,
    caseId: t.caseId,
    assignee: t.assignee,
    status: t.status,
    dueDate: t.dueDate,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const conditions: SQL[] = [];
  if (req.query.caseId) {
    const cid = parseInt(req.query.caseId as string, 10);
    if (!isNaN(cid)) conditions.push(eq(tasksTable.caseId, cid));
  }
  const rows = conditions.length
    ? await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.dueDate)
    : await db.select().from(tasksTable).orderBy(tasksTable.dueDate);
  res.json(rows.map(formatTask));
});

router.post("/", async (req, res) => {
  const parsed = taskInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [created] = await db.insert(tasksTable).values(parsed.data).returning();
  res.status(201).json(formatTask(created));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [found] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!found) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTask(found));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = taskUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [updated] = await db.update(tasksTable).set(parsed.data).where(eq(tasksTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTask(updated));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).end();
});

export default router;
