import { Router } from "express";
import { db } from "@workspace/db";
import { documentsTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const documentInputSchema = z.object({
  name: z.string().min(1),
  caseId: z.number().int(),
  date: z.string(),
  type: z.string(),
  notes: z.string().optional(),
});

const documentUpdateSchema = documentInputSchema.partial();

function formatDocument(d: typeof documentsTable.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    caseId: d.caseId,
    date: d.date,
    type: d.type,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
  };
}

// GET /documents?caseId=&search=
router.get("/", async (req, res) => {
  const conditions: SQL[] = [];
  if (req.query.caseId) {
    const cid = parseInt(req.query.caseId as string, 10);
    if (!isNaN(cid)) conditions.push(eq(documentsTable.caseId, cid));
  }
  if (req.query.search) {
    const s = `%${req.query.search}%`;
    conditions.push(ilike(documentsTable.name, s));
  }
  const docs = conditions.length
    ? await db.select().from(documentsTable).where(and(...conditions)).orderBy(documentsTable.createdAt)
    : await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
  res.json(docs.map(formatDocument));
});

// POST /documents
router.post("/", async (req, res) => {
  const parsed = documentInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [created] = await db.insert(documentsTable).values(parsed.data).returning();
  res.status(201).json(formatDocument(created));
});

// GET /documents/:id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [found] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
  if (!found) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatDocument(found));
});

// PATCH /documents/:id
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = documentUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [updated] = await db.update(documentsTable).set(parsed.data).where(eq(documentsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatDocument(updated));
});

// DELETE /documents/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(documentsTable).where(eq(documentsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).end();
});

export default router;
