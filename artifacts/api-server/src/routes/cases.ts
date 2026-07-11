import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const caseInputSchema = z.object({
  name: z.string().min(1),
  client: z.string().min(1),
  status: z.enum(["Active", "Pending", "Closed"]),
  description: z.string().optional(),
});

const caseUpdateSchema = caseInputSchema.partial();

function formatCase(c: typeof casesTable.$inferSelect) {
  const created = new Date(c.createdAt);
  const now = new Date();
  const daysActive = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return {
    id: c.id,
    name: c.name,
    client: c.client,
    status: c.status,
    description: c.description,
    daysActive,
    createdAt: c.createdAt.toISOString(),
  };
}

// GET /cases
router.get("/", async (req, res) => {
  const cases = await db.select().from(casesTable).orderBy(casesTable.createdAt);
  res.json(cases.map(formatCase));
});

// POST /cases
router.post("/", async (req, res) => {
  const parsed = caseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }
  const [created] = await db.insert(casesTable).values(parsed.data).returning();
  res.status(201).json(formatCase(created));
});

// GET /cases/:id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!found) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatCase(found));
});

// PATCH /cases/:id
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = caseUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }
  const [updated] = await db.update(casesTable).set(parsed.data).where(eq(casesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatCase(updated));
});

// DELETE /cases/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(casesTable).where(eq(casesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).end();
});

export default router;
