import { Router } from "express";
import { db } from "@workspace/db";
import { deadlinesTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const deadlineInputSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  caseId: z.number().int(),
  priority: z.enum(["High", "Medium", "Low"]),
});

const deadlineUpdateSchema = deadlineInputSchema.partial();

function formatDeadline(d: typeof deadlinesTable.$inferSelect) {
  return {
    id: d.id,
    title: d.title,
    date: d.date,
    caseId: d.caseId,
    priority: d.priority,
    createdAt: d.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const conditions: SQL[] = [];
  if (req.query.caseId) {
    const cid = parseInt(req.query.caseId as string, 10);
    if (!isNaN(cid)) conditions.push(eq(deadlinesTable.caseId, cid));
  }
  const rows = conditions.length
    ? await db.select().from(deadlinesTable).where(and(...conditions)).orderBy(deadlinesTable.date)
    : await db.select().from(deadlinesTable).orderBy(deadlinesTable.date);
  res.json(rows.map(formatDeadline));
});

router.post("/", async (req, res) => {
  const parsed = deadlineInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [created] = await db.insert(deadlinesTable).values(parsed.data).returning();
  res.status(201).json(formatDeadline(created));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [found] = await db.select().from(deadlinesTable).where(eq(deadlinesTable.id, id));
  if (!found) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatDeadline(found));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = deadlineUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [updated] = await db.update(deadlinesTable).set(parsed.data).where(eq(deadlinesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatDeadline(updated));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(deadlinesTable).where(eq(deadlinesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).end();
});

export default router;
