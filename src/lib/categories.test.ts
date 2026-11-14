import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_CATEGORIES, categoryLabel, parseCategory } from "./categories";

describe("parseCategory", () => {
  it("accepts each official category and its URL slug", () => {
    for (const item of PRODUCT_CATEGORIES) {
      assert.equal(parseCategory(item.value)?.value, item.value);
      assert.equal(parseCategory(item.slug)?.value, item.value);
      assert.equal(parseCategory(item.label)?.value, item.value);
    }
  });

  it("maps pre-roll aliases", () => {
    assert.equal(parseCategory("preroll")?.value, "PREROLL");
    assert.equal(parseCategory("Pre-rolls")?.value, "PREROLL");
  });

  it("rejects empty or unknown values", () => {
    assert.equal(parseCategory(""), null);
    assert.equal(parseCategory("  "), null);
    assert.equal(parseCategory(null), null);
    assert.equal(parseCategory("gummy"), null);
  });
});

describe("categoryLabel", () => {
  it("returns the public label", () => {
    assert.equal(categoryLabel("FLOWER"), "Flower");
    assert.equal(categoryLabel("pre-roll"), "Pre-roll");
  });
});
