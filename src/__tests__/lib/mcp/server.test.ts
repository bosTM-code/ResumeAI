import { describe, it, expect, vi, beforeEach } from "vitest";

type ToolHandler = (request?: unknown) => Promise<unknown>;

const { capturedHandlers } = vi.hoisted(() => ({
  capturedHandlers: new Map<string, ToolHandler>(),
}));

vi.mock("@modelcontextprotocol/sdk/types.js", () => ({
  ListToolsRequestSchema: "LIST_TOOLS",
  CallToolRequestSchema: "CALL_TOOL",
}));

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: class {
    setRequestHandler(schema: string, handler: ToolHandler) {
      capturedHandlers.set(schema, handler);
    }
  },
}));

import { createResumeServer } from "@/lib/mcp/server";

type ToolsResult = { tools: Array<{ name: string; description: string; inputSchema: unknown }> };
type ToolCallResult = { content: Array<{ type: string; text: string }>; isError?: boolean };

function callTool(name: string, args: Record<string, unknown> = {}): Promise<ToolCallResult> {
  const handler = capturedHandlers.get("CALL_TOOL")!;
  return handler({ params: { name, arguments: args } }) as Promise<ToolCallResult>;
}

describe("MCP Resume Server", () => {
  beforeEach(() => {
    capturedHandlers.clear();
    createResumeServer();
  });

  it("registers ListTools and CallTool handlers on creation", () => {
    expect(capturedHandlers.has("LIST_TOOLS")).toBe(true);
    expect(capturedHandlers.has("CALL_TOOL")).toBe(true);
  });

  describe("listTools", () => {
    it("exposes exactly 3 tools", async () => {
      const handler = capturedHandlers.get("LIST_TOOLS")!;
      const result = (await handler()) as ToolsResult;
      expect(result.tools).toHaveLength(3);
    });

    it("includes get_ats_keywords tool", async () => {
      const handler = capturedHandlers.get("LIST_TOOLS")!;
      const result = (await handler()) as ToolsResult;
      const names = result.tools.map((t) => t.name);
      expect(names).toContain("get_ats_keywords");
    });

    it("includes get_scoring_criteria tool", async () => {
      const handler = capturedHandlers.get("LIST_TOOLS")!;
      const result = (await handler()) as ToolsResult;
      const names = result.tools.map((t) => t.name);
      expect(names).toContain("get_scoring_criteria");
    });

    it("includes get_improvement_tips tool", async () => {
      const handler = capturedHandlers.get("LIST_TOOLS")!;
      const result = (await handler()) as ToolsResult;
      const names = result.tools.map((t) => t.name);
      expect(names).toContain("get_improvement_tips");
    });

    it("each tool has a non-empty description", async () => {
      const handler = capturedHandlers.get("LIST_TOOLS")!;
      const result = (await handler()) as ToolsResult;
      result.tools.forEach((tool) => {
        expect(tool.description).toBeTruthy();
      });
    });
  });

  describe("get_ats_keywords", () => {
    it("returns React and TypeScript for Frontend Developer", async () => {
      const result = await callTool("get_ats_keywords", { field: "Frontend Developer" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("React");
      expect(parsed.keywords).toContain("TypeScript");
    });

    it("returns Node.js and Docker for Backend Engineer", async () => {
      const result = await callTool("get_ats_keywords", { field: "Backend Engineer" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("Node.js");
      expect(parsed.keywords).toContain("Docker");
    });

    it("returns Python and machine learning for Data Scientist", async () => {
      const result = await callTool("get_ats_keywords", { field: "Data Scientist" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("Python");
      expect(parsed.keywords).toContain("machine learning");
    });

    it("returns Agile and Scrum for Project Manager", async () => {
      const result = await callTool("get_ats_keywords", { field: "Project Manager" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("Agile");
      expect(parsed.keywords).toContain("Scrum");
    });

    it("returns Figma keywords for Designer", async () => {
      const result = await callTool("get_ats_keywords", { field: "UX Designer" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("Figma");
    });

    it("returns Kubernetes keywords for DevOps Engineer", async () => {
      const result = await callTool("get_ats_keywords", { field: "DevOps Engineer" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("Kubernetes");
    });

    it("returns default general keywords for an unknown field", async () => {
      const result = await callTool("get_ats_keywords", { field: "Space Archaeologist" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.keywords).toContain("teamwork");
      expect(parsed.keywords).toContain("leadership");
    });

    it("echoes the field name in the response", async () => {
      const result = await callTool("get_ats_keywords", { field: "Frontend Developer" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.field).toBe("Frontend Developer");
    });
  });

  describe("get_scoring_criteria", () => {
    it("returns all six scoring sections", async () => {
      const result = await callTool("get_scoring_criteria");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty("overall");
      expect(parsed).toHaveProperty("structure");
      expect(parsed).toHaveProperty("contact");
      expect(parsed).toHaveProperty("experience");
      expect(parsed).toHaveProperty("education");
      expect(parsed).toHaveProperty("skills");
    });

    it("each section has three evaluation tiers", async () => {
      const result = await callTool("get_scoring_criteria");
      const parsed = JSON.parse(result.content[0].text);
      const sections = ["structure", "contact", "experience", "education", "skills"];
      sections.forEach((section) => {
        expect(parsed[section]).toHaveProperty("excellent");
        expect(parsed[section]).toHaveProperty("good");
        expect(parsed[section]).toHaveProperty("poor");
      });
    });

    it("overall section contains score range strings", async () => {
      const result = await callTool("get_scoring_criteria");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.overall.excellent).toContain("80");
      expect(parsed.overall.poor).toContain("0");
    });
  });

  describe("get_improvement_tips", () => {
    const sections = ["experience", "education", "skills", "contact", "structure", "general"] as const;

    sections.forEach((section) => {
      it(`returns a non-empty tips array for section: ${section}`, async () => {
        const result = await callTool("get_improvement_tips", { section });
        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.tips).toBeInstanceOf(Array);
        expect(parsed.tips.length).toBeGreaterThan(0);
      });
    });

    it("echoes the section name in the response", async () => {
      const result = await callTool("get_improvement_tips", { section: "experience" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.section).toBe("experience");
    });

    it("falls back to general tips for an unrecognized section", async () => {
      const result = await callTool("get_improvement_tips", { section: "unknown_section" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.tips).toBeInstanceOf(Array);
      expect(parsed.tips.length).toBeGreaterThan(0);
    });
  });

  describe("unknown tool", () => {
    it("returns isError flag for an unrecognized tool name", async () => {
      const result = await callTool("nonexistent_tool");
      expect(result.isError).toBe(true);
    });

    it("includes the unknown tool name in the error message", async () => {
      const result = await callTool("nonexistent_tool");
      expect(result.content[0].text).toContain("nonexistent_tool");
    });
  });
});
