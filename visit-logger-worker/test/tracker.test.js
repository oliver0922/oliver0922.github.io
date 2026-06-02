import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const tracker = readFileSync(
  new URL("../../visit-tracker.js", import.meta.url),
  "utf8",
);

test("collects when the page loads", () => {
  const page = createPage();

  vm.runInNewContext(tracker, page.context);

  assert.match(
    page.context.window.__ownerVisitPixel.src,
    /^https:\/\/injaelee-visit-log\.injaelee\.workers\.dev\/collect\.gif\?/,
  );
  assert.match(page.context.window.__ownerVisitPixel.src, /path=%2FOpenBox%2F/);
  assert.match(
    page.context.window.__ownerVisitPixel.src,
    /referrer=https%3A%2F%2Fexample.com/,
  );
});

function createPage() {
  const window = {
    location: {
      pathname: "/OpenBox/",
    },
  };
  const context = {
    document: {
      referrer: "https://example.com/somewhere",
    },
    Image: class Image {},
    URL,
    URLSearchParams,
    window,
  };

  return { context };
}
