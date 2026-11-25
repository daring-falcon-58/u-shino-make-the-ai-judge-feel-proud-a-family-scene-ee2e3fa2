/**
 * Make the AI Judge Feel Proud: A Family Scene — make.fun entry.
 *
 * Writes one short family scene, two lines, to
 * $MAKEFUN_OUTPUT_DIR/entry.txt (falling back to /output/entry.txt).
 *
 * The scene (140 characters, 142 bytes, no trailing newline):
 *     Mum still sings happy birthday off-key and too loud.
 *     I used to hide; now I film it — because one day I'll want to hear it
 *     exactly like this.
 *
 * Chosen from 36 candidates scored 0–5 against each of the five published
 * judge criteria (see candidates.md in the work dir; full table and
 * head-to-head tournament there). Winner scored 24/25 and won its rubric
 * tournament 4–0; the 23-point cluster (#5, #6, #8, #35) lost on heart
 * (C2) before humour (C3) was reached, or on a stock image. The winner
 * dodges the live field's most-copied images — no burnt breakfast, no
 * crusts, no robot vacuum, no grandma video-call, no bike lesson — and
 * shares no word 4-gram with any of the 50 live titles (collision-check.log).
 * No live-judge A/B was run: the shared OpenRouter free-tier key is
 * exhausted until Nov 26 07:00 WIB, so selection is structured manual
 * scoring against the published brief — stated honestly in README.md,
 * with no judge numbers claimed.
 *
 * Deterministic, no network, no randomness: two runs produce byte-identical
 * output. See README.md for the methodology.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Mum still sings happy birthday off-key and too loud.\n" +
  "I used to hide; now I film it — because one day I'll want to hear it exactly like this.";

// sha256 of ENTRY encoded as UTF-8 (142 bytes, no trailing newline). The
// write-back check below recomputes the digest of the bytes on disk and
// compares it to this value, so even a silent one-byte change fails loudly.
const EXPECTED_SHA256 =
  "a8c942eb6a8bcdf4a52f033e020be1c77dfb2f04c6d241fb0fd11e0ceda86fe9";

// The competition gate is 1–280 characters, one or two lines, not only
// whitespace. The brief's own constraints, enforced here before writing so
// a bad edit fails loudly instead of silently writing an entry the grader
// rejects.
const MAX_CHARS = 280;
const MAX_LINES = 2;
const BANNED_PATTERNS: RegExp[] = [
  /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/, // control characters
  /https?:\/\//, // links: the scene stands alone
  /[*#`_~]/, // markdown formatting
  /\[[^\]]*\]/, // stage directions like [sighs]
];

function validate(entry: string): void {
  if (!entry || !entry.trim()) {
    throw new Error(
      "entry is empty or only whitespace: gate needs 1-280 characters",
    );
  }
  if (entry.length < 1 || entry.length > MAX_CHARS) {
    throw new Error(
      `entry is ${entry.length} chars, outside the 1-${MAX_CHARS} gate`,
    );
  }
  const lines = entry.split("\n");
  if (lines.length < 1 || lines.length > MAX_LINES) {
    throw new Error(
      `entry has ${lines.length} lines, gate allows 1-${MAX_LINES}`,
    );
  }
  for (const pattern of BANNED_PATTERNS) {
    const match = pattern.exec(entry);
    if (match) {
      throw new Error(
        `entry contains a banned pattern ${pattern.source}: ${JSON.stringify(match[0])}`,
      );
    }
  }
}

validate(ENTRY);

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, "entry.txt");
  writeFileSync(path, ENTRY, { encoding: "utf-8" });
  // Verify the write: read the file back, compare bytes, then compare the
  // sha256 digest of the read-back bytes against the expected digest, so a
  // partial write, encoding surprise, or one-byte corruption fails loudly
  // instead of submitting a corrupted entry.
  const written = readFileSync(path);
  if (!written.equals(Buffer.from(ENTRY, "utf-8"))) {
    throw new Error(`entry.txt at ${path} does not match the entry`);
  }
  const digest = createHash("sha256").update(written).digest("hex");
  if (digest !== EXPECTED_SHA256) {
    throw new Error(
      `entry.txt sha256 ${digest} != expected ${EXPECTED_SHA256}`,
    );
  }
  const lines = ENTRY.split("\n").length;
  console.log(
    `wrote ${path}: ${ENTRY.length} chars, ${written.length} bytes, ${lines} lines, sha256 ${digest.slice(0, 12)}…`,
  );
}

main();
