import { describe, it, expect } from "vitest";
import { cn, formatBytes, formatDate, slugify, scoreColor, scoreBg } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("resolves Tailwind conflicting classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("foo", undefined, null as unknown as string)).toBe("foo");
  });

  it("merges conditional array of classes", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
  });
});

describe("formatBytes", () => {
  it("returns '0 Bytes' for zero", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats exact kilobyte", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats exact megabyte", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("formats exact gigabyte", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("formats fractional kilobytes", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats bytes less than 1 KB", () => {
    expect(formatBytes(512)).toBe("512 Bytes");
  });
});

describe("formatDate", () => {
  it("formats a date string and includes the year", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("2024");
  });

  it("formats a Date object and includes the year", () => {
    const result = formatDate(new Date("2024-06-01"));
    expect(result).toContain("2024");
  });

  it("returns a non-empty string", () => {
    const result = formatDate("2023-12-31");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("slugify", () => {
  it("converts text to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("my blog post")).toBe("my-blog-post");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("collapses multiple consecutive hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("-hello-")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles strings with only special characters", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("preserves numbers", () => {
    expect(slugify("Post 42 Title")).toBe("post-42-title");
  });
});

describe("scoreColor", () => {
  it("returns green class for score of exactly 80", () => {
    expect(scoreColor(80)).toBe("text-green-600");
  });

  it("returns green class for score of 100", () => {
    expect(scoreColor(100)).toBe("text-green-600");
  });

  it("returns yellow class for score of exactly 60", () => {
    expect(scoreColor(60)).toBe("text-yellow-600");
  });

  it("returns yellow class for score of 79", () => {
    expect(scoreColor(79)).toBe("text-yellow-600");
  });

  it("returns red class for score of 59", () => {
    expect(scoreColor(59)).toBe("text-red-600");
  });

  it("returns red class for score of 0", () => {
    expect(scoreColor(0)).toBe("text-red-600");
  });
});

describe("scoreBg", () => {
  it("returns green background for score >= 80", () => {
    expect(scoreBg(85)).toBe("bg-green-100 text-green-800");
  });

  it("returns green background for exactly 80", () => {
    expect(scoreBg(80)).toBe("bg-green-100 text-green-800");
  });

  it("returns yellow background for score in range 60–79", () => {
    expect(scoreBg(65)).toBe("bg-yellow-100 text-yellow-800");
  });

  it("returns yellow background for exactly 60", () => {
    expect(scoreBg(60)).toBe("bg-yellow-100 text-yellow-800");
  });

  it("returns red background for score < 60", () => {
    expect(scoreBg(40)).toBe("bg-red-100 text-red-800");
  });

  it("returns red background for score of 0", () => {
    expect(scoreBg(0)).toBe("bg-red-100 text-red-800");
  });
});
