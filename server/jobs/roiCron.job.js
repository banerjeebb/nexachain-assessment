/**
 * @file roiCron.job.js
 * @description Daily ROI cron job scheduler.
 *
 * Fires once every day at 00:00 IST (Asia/Kolkata) via node-cron.
 * Delegates the actual ROI calculation and crediting to roiService.processROI(),
 * which is itself idempotent — this file's responsibility is purely scheduling,
 * locking, and operational logging.
 *
 * ─── Idempotency layers ────────────────────────────────────────────────────────
 *
 *  Layer 1 — Boolean in-process lock (this file)
 *    The `isRunning` flag prevents a second cron tick from spawning a new run
 *    while the previous one is still executing. This covers the case where
 *    processROI() takes longer than 24 h (unlikely but safe to guard).
 *
 *  Layer 2 — Application-level pre-check (roi.service.js)
 *    Before opening a transaction for each investment, processROI() queries
 *    ROIHistory for an existing record with the same (investmentId + date).
 *    If found, that investment is skipped without touching the DB.
 *
 *  Layer 3 — Database unique index (ROIHistory model)
 *    A compound unique index on { investmentId, date } is the last line of
 *    defence. Even if layers 1 and 2 both fail simultaneously (e.g. two
 *    server instances running the cron), the DB will reject the second insert
 *    with E11000, which processROI() catches and counts as a skip.
 *
 * ─── Timing note ──────────────────────────────────────────────────────────────
 *  Cron expression '0 0 * * *' = "at minute 0, hour 0, every day".
 *  The `timezone: 'Asia/Kolkata'` option makes node-cron interpret that as
 *  00:00 IST (UTC+5:30), so the job fires at 18:30 UTC the previous calendar day.
 *  ROIHistory.date is always stored as midnight UTC, which is correct regardless
 *  of when this job fires — roi.service.js computes it from Date.UTC(), not
 *  from the local clock.
 */

const cron           = require('node-cron');
const { processROI } = require('../services/roi.service');

// ── In-process execution lock ──────────────────────────────────────────────────
// A simple boolean is sufficient here because Node.js is single-threaded —
// there is no race condition between the check and the assignment.
// This would NOT be sufficient in a multi-process or multi-instance deployment;
// a distributed lock (Redis SETNX, MongoDB findOneAndUpdate) would be needed there.
let isRunning = false;

/**
 * Formats elapsed milliseconds into a human-readable string.
 * e.g. 75340 ms → "1m 15s 340ms"
 *
 * @param {number} ms
 * @returns {string}
 */
const formatDuration = (ms) => {
  const minutes      = Math.floor(ms / 60_000);
  const seconds      = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = ms % 1_000;
  const parts = [];
  if (minutes)      parts.push(`${minutes}m`);
  if (seconds)      parts.push(`${seconds}s`);
  parts.push(`${milliseconds}ms`);
  return parts.join(' ');
};

// ── Schedule registration ──────────────────────────────────────────────────────
/**
 * node-cron task: fires daily at 00:00 IST.
 *
 * The handler is async so we can await processROI() and capture its summary.
 * node-cron ignores the returned Promise, so unhandled rejections must be
 * caught inside the handler — which the try/catch below does.
 */
const task = cron.schedule(
  '0 0 * * *',

  async () => {
    const triggerTime = new Date();

    // ── Lock check ────────────────────────────────────────────────────────────
    // If a previous run is still in progress, log a warning and bail out.
    // This is the Layer 1 guard described in the file header.
    if (isRunning) {
      console.warn(
        `[ROI CRON] ⚠ Skipped — previous run still in progress at ${triggerTime.toISOString()}`
      );
      return;
    }

    // ── Acquire lock ──────────────────────────────────────────────────────────
    isRunning = true;
    const startMs = Date.now();

    console.log('─'.repeat(60));
    console.log(`[ROI CRON] ▶ Run started at ${triggerTime.toISOString()}`);
    console.log(`[ROI CRON]   Processing investments for date: ${triggerTime.toDateString()}`);
    console.log('─'.repeat(60));

    try {
      // ── Delegate to the service ───────────────────────────────────────────
      // processROI() handles all DB work; it returns a summary object so we
      // can emit a structured log line for monitoring / alerting tools.
      const summary = await processROI();

      const elapsed = formatDuration(Date.now() - startMs);

      console.log('─'.repeat(60));
      console.log(`[ROI CRON] ✔ Run completed in ${elapsed}`);
      console.log(`[ROI CRON]   ✔ Processed : ${summary.processed}`);
      console.log(`[ROI CRON]   ⊘ Skipped   : ${summary.skipped}  (already credited today)`);
      console.log(`[ROI CRON]   ✖ Errors    : ${summary.errors}`);
      console.log('─'.repeat(60));

      // Surface a warning if any investments errored — useful for alert hooks.
      if (summary.errors > 0) {
        console.warn(
          `[ROI CRON] ⚠ ${summary.errors} investment(s) failed to credit. ` +
          `Check logs above for individual error details.`
        );
      }

    } catch (fatalErr) {
      // ── Fatal error handler ───────────────────────────────────────────────
      // processROI() is designed to catch per-investment errors internally and
      // never throw. A rejection reaching here means something truly unexpected
      // happened (e.g. DB connection lost before any query ran).
      const elapsed = formatDuration(Date.now() - startMs);
      console.error('─'.repeat(60));
      console.error(`[ROI CRON] ✖ FATAL error after ${elapsed}: ${fatalErr.message}`);
      console.error(`[ROI CRON]   Stack: ${fatalErr.stack}`);
      console.error('─'.repeat(60));

    } finally {
      // ── Release lock ──────────────────────────────────────────────────────
      // Always release, even if the try block threw — otherwise the lock
      // stays on forever and all future cron ticks are silently skipped.
      isRunning = false;
      console.log(`[ROI CRON] Lock released at ${new Date().toISOString()}`);
    }
  },

  {
    // node-cron interprets the cron expression in this timezone.
    timezone: 'Asia/Kolkata',

    // Do NOT fire immediately on registration — only on the scheduled tick.
    runOnInit: false,
  }
);

// ── Startup confirmation ───────────────────────────────────────────────────────
console.log('[ROI CRON] Registered — fires daily at 00:00 IST (Asia/Kolkata)');

/**
 * Exposed for integration tests that want to trigger the job manually
 * without going through the cron scheduler.
 *
 * Example (test file):
 *   const { runNow } = require('./jobs/roiCron.job');
 *   await runNow();
 *
 * @returns {Promise<void>}
 */
const runNow = async () => {
  if (isRunning) {
    console.warn('[ROI CRON] runNow() called but job is already running — skipped');
    return;
  }
  console.log('[ROI CRON] Manual trigger via runNow()');
  isRunning = true;
  const startMs = Date.now();
  try {
    const summary = await processROI();
    const elapsed = formatDuration(Date.now() - startMs);
    console.log(`[ROI CRON] Manual run done in ${elapsed}:`, summary);
    return summary;
  } finally {
    isRunning = false;
  }
};

module.exports = { task, runNow };
