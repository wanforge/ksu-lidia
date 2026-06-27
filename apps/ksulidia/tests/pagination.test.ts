import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampPage,
  getPageCount,
  getSkip,
  parsePage,
} from "../src/lib/pagination";

test("parsePage falls back to 1 for invalid input", () => {
  assert.equal(parsePage(undefined), 1);
  assert.equal(parsePage(null), 1);
  assert.equal(parsePage(""), 1);
  assert.equal(parsePage("abc"), 1);
  assert.equal(parsePage("0"), 1);
  assert.equal(parsePage("-3"), 1);
});

test("parsePage reads valid page numbers", () => {
  assert.equal(parsePage("1"), 1);
  assert.equal(parsePage("7"), 7);
  assert.equal(parsePage("12abc"), 12);
});

test("getPageCount never returns less than 1", () => {
  assert.equal(getPageCount(0, 25), 1);
  assert.equal(getPageCount(-5, 25), 1);
  assert.equal(getPageCount(10, 0), 1);
});

test("getPageCount rounds up partial pages", () => {
  assert.equal(getPageCount(25, 25), 1);
  assert.equal(getPageCount(26, 25), 2);
  assert.equal(getPageCount(50, 25), 2);
  assert.equal(getPageCount(51, 25), 3);
});

test("clampPage keeps the page within bounds", () => {
  assert.equal(clampPage(0, 5), 1);
  assert.equal(clampPage(3, 5), 3);
  assert.equal(clampPage(9, 5), 5);
});

test("getSkip computes the offset for a page", () => {
  assert.equal(getSkip(1, 25), 0);
  assert.equal(getSkip(2, 25), 25);
  assert.equal(getSkip(3, 50), 100);
});
