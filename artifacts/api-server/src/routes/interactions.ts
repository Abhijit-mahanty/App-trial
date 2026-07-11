import { Router } from "express";
import { db } from "@workspace/db";
import { interactionsTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const interactionInputSchema = z.object({
  caseId: z.number().int(),
  client: z.string(),
  date: z.string(),
  type: z.enum(["Phone Call", "Email", "Meeting", "Letter"]),
  notes: z.string(),
});

const interactionUpdateSchema = interactionInputSchema.partial();

function formatInteraction(i: typeof interactionsTable.$inferSelect) {
  return {
    id: i.id,
    caseId: i.caseId,
    client: i.client,
    date: i.date,
    type: i.type,
    notes: i.notes,
    createdAt: i.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const conditions: SQL[] = [];
  if (req.query.caseId) {
    const cid = parseInt(req.query.caseId as string, 10);
    if (!isNaN(cid)) conditions.push(eq(interactionsTable.caseId, cid));
  }
  const rows = conditions.length
    ? await db.select().from(interactionsTable).where(and(...conditions)).orderBy(interactionsTable.date)
    : await db.select().from(interactionsTable).orderBy(interactionsTable.date);
  res.json(rows.map(formatInteraction));
});

router.post("/", async (req, res) => {
  const parsed = interactionInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [created] = await db.insert(interactionsTable).values(parsed.data).returning();
  res.status(201).json(formatInteraction(created));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [found] = await db.select().from(interactionsTable).where(eq(interactionsTable.id, id));
  if (!found) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatInteraction(found));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = interactionUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [updated] = await db.update(interactionsTable).set(parsed.data).where(eq(interactionsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatInteraction(updated));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(interactionsTable).where(eq(interactionsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).end();
});

export default router;
