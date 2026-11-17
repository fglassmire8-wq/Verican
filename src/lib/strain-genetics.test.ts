import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeStrainKey } from "./strain-key";

describe("normalizeStrainKey", () => {
  it("lowercases and strips punctuation", () => {
    assert.equal(normalizeStrainKey("Cap Junky"), "cap junky");
    assert.equal(normalizeStrainKey("GRAS - CAP JUNKY FLOWER: 14G (Indica)"), "gras cap junky flower 14g indica");
    assert.equal(normalizeStrainKey("Chem Scout '87"), "chem scout 87");
  });
});
