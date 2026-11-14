import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reviewGridColumnCounts, reviewGridExtraColumns } from "./review-grid";

describe("reviewGridColumnCounts", () => {
  it("uses the base 3 / 5 / 6 / 8 columns for a short list", () => {
    assert.equal(reviewGridExtraColumns(4), 0);
    assert.deepEqual(reviewGridColumnCounts(4), {
      mobile: 3,
      tablet: 5,
      desktop: 6,
      wide: 8,
    });
    assert.deepEqual(reviewGridColumnCounts(12), {
      mobile: 3,
      tablet: 5,
      desktop: 6,
      wide: 8,
    });
  });

  it("adds one column at each breakpoint when there are more than 12 reviews", () => {
    assert.deepEqual(reviewGridColumnCounts(13), {
      mobile: 4,
      tablet: 6,
      desktop: 7,
      wide: 9,
    });
  });

  it("adds two columns at each breakpoint when there are more than 30 reviews", () => {
    assert.deepEqual(reviewGridColumnCounts(31), {
      mobile: 5,
      tablet: 7,
      desktop: 8,
      wide: 10,
    });
  });
});
