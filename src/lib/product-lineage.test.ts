import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LINEAGE_MAX_LENGTH,
  normalizeLineage,
  publicLineage,
} from "./product-lineage";

describe("normalizeLineage", () => {
  it("stores trimmed manual lineage and does not invent a value", () => {
    const result = normalizeLineage("  Cap Junky x Rosetta Stone  ");
    assert.deepEqual(result, { ok: true, lineage: "Cap Junky x Rosetta Stone" });
  });

  it("treats empty, whitespace, and null as unset", () => {
    assert.deepEqual(normalizeLineage(""), { ok: true, lineage: null });
    assert.deepEqual(normalizeLineage("   "), { ok: true, lineage: null });
    assert.deepEqual(normalizeLineage(null), { ok: true, lineage: null });
    assert.deepEqual(normalizeLineage(undefined), { ok: true, lineage: null });
  });

  it("rejects lineage longer than the limit", () => {
    const tooLong = "x".repeat(LINEAGE_MAX_LENGTH + 1);
    const result = normalizeLineage(tooLong);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /300/);
  });

  it("accepts lineage at the limit", () => {
    const text = "x".repeat(LINEAGE_MAX_LENGTH);
    assert.deepEqual(normalizeLineage(text), { ok: true, lineage: text });
  });
});

describe("publicLineage", () => {
  it("hides empty or whitespace-only values from the public product page", () => {
    assert.equal(publicLineage(null), null);
    assert.equal(publicLineage(""), null);
    assert.equal(publicLineage("   "), null);
    assert.equal(publicLineage("Cap Junky x Rosetta Stone"), "Cap Junky x Rosetta Stone");
  });
});
