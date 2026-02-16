import { Router, type Request, type Response } from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

const router = Router();

const SIM_SCRIPT = path.resolve(__dirname, "..", "..", "..", "pragma-agent", "scripts", "sim-flow.ts");
const SIM_STATE_DIR = path.resolve(__dirname, "..", "..", "..", "pragma-agent", "sim-flows");

const ALLOWED_STEPS = new Set([
  "init",
  "register",
  "seed",
  "register-service",
  "pay",
  "all",
  "reset",
  "orchestrate-deal",
]);

function parseJsonLines(output: string) {
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const events: unknown[] = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // ignore non-json lines
    }
  }
  return events;
}

/**
 * @openapi
 * /sim/step:
 *   post:
 *     summary: Run a simulation step
 *     description: Executes a step in pragma-agent/scripts/sim-flow.ts and returns JSON events.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               runId:
 *                 type: string
 *                 example: sim1
 *               step:
 *                 type: string
 *                 enum: [init, register, seed, register-service, pay, all, reset]
 *                 example: init
 *     responses:
 *       200:
 *         description: Simulation step executed
 */
router.post("/step", async (req: Request, res: Response) => {
  const { runId = "default", step } = req.body as { runId?: string; step?: string };
  if (!step || !ALLOWED_STEPS.has(step)) {
    res.status(400).json({ ok: false, error: "Invalid step" });
    return;
  }

  const args = ["tsx", SIM_SCRIPT, "--run", runId, "--step", step, "--json"];
  const proc = spawn("npx", args, { env: process.env });

  let stdout = "";
  let stderr = "";

  proc.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  proc.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  proc.on("close", (code) => {
    const events = parseJsonLines(stdout);
    if (code !== 0) {
      res.status(500).json({ ok: false, error: stderr || "Sim flow failed", events });
      return;
    }
    res.json({ ok: true, runId, step, events, logs: stderr.split(/\r?\n/).filter(Boolean) });
  });
});

/**
 * @openapi
 * /sim/state/{runId}:
 *   get:
 *     summary: Get the saved simulation state
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Simulation state JSON
 *       404:
 *         description: Not found
 */
router.get("/state/:runId", async (req: Request, res: Response) => {
  const { runId } = req.params;
  const file = path.join(SIM_STATE_DIR, `${runId}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    res.json(JSON.parse(raw));
  } catch {
    res.status(404).json({ ok: false, error: "State not found" });
  }
});

export { router as simulationRouter };
