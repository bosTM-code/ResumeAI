import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ResumeAnalysisResult } from "@/lib/claude";

const { mockListTools, mockCallTool, mockCreate } = vi.hoisted(() => ({
  mockListTools: vi.fn(),
  mockCallTool: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/mcp/client", () => ({
  getMcpClient: vi.fn().mockResolvedValue({
    listTools: mockListTools,
    callTool: mockCallTool,
  }),
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
    vi.clearAllMocks();

    mockListTools.mockResolvedValue({
      tools: [
        {
          name: "get_scoring_criteria",
          description: "Get scoring criteria",
          inputSchema: { type: "object", properties: {}, required: [] },
        },
      ],
    });

    mockCallTool.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ overall: { excellent: "80-100" } }) }],
    });
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

  describe("tool-use loop", () => {
    it("executes a tool call and then returns the final analysis", async () => {
      mockCreate
        .mockResolvedValueOnce({
          stop_reason: "tool_use",
          content: [{ type: "tool_use", id: "tool_abc", name: "get_scoring_criteria", input: {} }],
        })
        .mockResolvedValueOnce({
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify(FULL_ANALYSIS) }],
        });

      const result = await analyzeResume(SAMPLE_RESUME);

      expect(mockCallTool).toHaveBeenCalledWith({ name: "get_scoring_criteria", arguments: {} });
      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result.overallScore).toBe(82);
    });

    it("passes the tool result back to Claude in the follow-up message", async () => {
      mockCreate
        .mockResolvedValueOnce({
          stop_reason: "tool_use",
          content: [{ type: "tool_use", id: "tool_xyz", name: "get_scoring_criteria", input: {} }],
        })
        .mockResolvedValueOnce({
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify(FULL_ANALYSIS) }],
        });

      await analyzeResume(SAMPLE_RESUME);

      // messages is passed by reference and mutated after each call, so check
      // index 2: [user(initial), assistant(tool_use), user(tool_results), ...]
      const secondCallMessages = mockCreate.mock.calls[1][0].messages;
      const toolResultMsg = secondCallMessages[2];
      expect(toolResultMsg.role).toBe("user");
      expect(Array.isArray(toolResultMsg.content)).toBe(true);
      expect(toolResultMsg.content[0]).toMatchObject({ type: "tool_result", tool_use_id: "tool_xyz" });
    });

    it("converts MCP tools to the Anthropic tool format", async () => {
      mockCreate.mockResolvedValueOnce({
        stop_reason: "end_turn",
        content: [{ type: "text", text: JSON.stringify(FULL_ANALYSIS) }],
      });

      await analyzeResume(SAMPLE_RESUME);

      const calledTools = mockCreate.mock.calls[0][0].tools;
      expect(Array.isArray(calledTools)).toBe(true);
      expect(calledTools[0]).toHaveProperty("name");
      expect(calledTools[0]).toHaveProperty("description");
      expect(calledTools[0]).toHaveProperty("input_schema");
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
