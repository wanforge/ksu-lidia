import assert from "node:assert/strict";
import { test } from "node:test";
import { maskNik } from "../src/lib/pii";

test("maskNik returns '-' for empty values", () => {
  assert.equal(maskNik(null), "-");
  assert.equal(maskNik(undefined), "-");
  assert.equal(maskNik(""), "-");
  assert.equal(maskNik("   "), "-");
});

test("maskNik shows first 4 and last 4 of a 16-digit NIK", () => {
  assert.equal(maskNik("3503123412341234"), "3503••••••••1234");
});

test("maskNik fully masks short values", () => {
  assert.equal(maskNik("12345678"), "••••••••");
  assert.equal(maskNik("123"), "•••");
});
