import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ResumeAnalysisResult } from "@/lib/claude";

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

import { analyzeResume } from "@/lib/claude";

const SAMPLE_RESUME = `
John Doe
john.doe@email.com | +1 (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

EXPERIENCE
Senior Software Engineer — Tech Corp (Jan 2022 – Present)
  • Led migration to microservices, reducing deployment time by 40%
  • Built REST APIs serving 500k daily requests with 99.9% uptime

EDUCATION
B.S. Computer Science — State University (2019)

SKILLS
JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker
`;

const FULL_ANALYSIS: ResumeAnalysisResult = {
  overallScore: 82,
  structureScore: 80,
  contactScore: 90,
  experienceScore: 88,
  educationScore: 72,
  skillsScore: 85,
  hasContact: true,
  hasExperience: true,
  hasEducation: true,
  skills: ["JavaScript", "TypeScript", "React", "Node.js"],
  keywords: ["microservices", "REST API", "Docker"],
  recommendations: ["Add portfolio link", "Quantify more achievements"],
  weaknesses: ["No certifications listed"],
};

describe("analyzeResume", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("successful analysis", () => {
    it("returns a valid analysis result when Claude responds immediately", async () => {
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "text", text: JSON.stringify(FULL_ANALYSIS) }],
      });

      const result = await analyzeResume(SAMPLE_RESUME);

      expect(result.overallScore).toBe(82);
      expect(result.hasContact).toBe(true);
      expect(result.hasExperience).toBe(true);
      expect(result.hasEducation).toBe(true);
    });

    it("returns the skills array from the analysis", async () => {
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "text", text: JSON.stringify(FULL_ANALYSIS) }],
      });

      const result = await analyzeResume(SAMPLE_RESUME);

      expect(result.skills).toContain("JavaScript");
      expect(result.skills).toContain("TypeScript");
    });

    it("strips ```json code fences before parsing", async () => {
      const fenced = "```json\n" + JSON.stringify(FULL_ANALYSIS) + "\n```";
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "text", text: fenced }],
      });

      const result = await analyzeResume(SAMPLE_RESUME);
      expect(result.overallScore).toBe(82);
    });

    it("strips plain ``` code fences before parsing", async () => {
      const fenced = "```\n" + JSON.stringify(FULL_ANALYSIS) + "\n```";
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "text", text: fenced }],
      });

      const result = await analyzeResume(SAMPLE_RESUME);
      expect(result.overallScore).toBe(82);
    });
  });

  describe("error handling", () => {
    it("throws when end_turn response contains no text block", async () => {
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "tool_use", id: "x", name: "foo", input: {} }],
      });

      await expect(analyzeResume(SAMPLE_RESUME)).rejects.toThrow("No text response from Claude");
    });

    it("throws when Claude returns malformed JSON", async () => {
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "text", text: "This is definitely not JSON" }],
      });

      await expect(analyzeResume(SAMPLE_RESUME)).rejects.toThrow();
    });
  });
});
