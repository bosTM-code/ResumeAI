import Anthropic from "@anthropic-ai/sdk";
import { getMcpClient } from "./mcp/client";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ResumeAnalysisResult {
  overallScore: number;
  structureScore: number;
  contactScore: number;
  experienceScore: number;
  educationScore: number;
  skillsScore: number;
  hasContact: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  skills: string[];
  keywords: string[];
  recommendations: string[];
  weaknesses: string[];
}

export async function analyzeResume(
  resumeText: string
): Promise<ResumeAnalysisResult> {
  // 1. Connect to MCP server and get available tools
  const mcpClient = await getMcpClient();
  const { tools: mcpTools } = await mcpClient.listTools();

  // 2. Convert MCP tools to Anthropic tool format
  const tools: Anthropic.Tool[] = mcpTools.map((t) => ({
    name: t.name,
    description: t.description ?? "",
    input_schema: t.inputSchema as Anthropic.Tool["input_schema"],
  }));

  // 3. Build the initial prompt
  const systemPrompt = `You are an expert resume reviewer and career coach specializing in Ukrainian and international job markets.
You have access to tools that provide ATS keywords, scoring criteria, and improvement tips — use them BEFORE scoring to ensure accuracy.

After using the tools, respond with ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "overallScore": <0-100 integer>,
  "structureScore": <0-100 integer>,
  "contactScore": <0-100 integer>,
  "experienceScore": <0-100 integer>,
  "educationScore": <0-100 integer>,
  "skillsScore": <0-100 integer>,
  "hasContact": <true/false>,
  "hasExperience": <true/false>,
  "hasEducation": <true/false>,
  "skills": [<list of skills found in resume, max 20 strings>],
  "keywords": [<list of important keywords/technologies found, max 20 strings>],
  "recommendations": [<list of 5-8 specific improvement recommendations>],
  "weaknesses": [<list of 3-5 identified weaknesses or missing elements>]
}`;

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Please analyze this resume. First use the tools to get scoring criteria and relevant ATS keywords, then provide the full JSON analysis.\n\nResume text:\n---\n${resumeText}\n---`,
    },
  ];

  // 4. Tool-calling loop — continues until Claude stops calling tools
  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      tools,
      messages,
    });

    // Add assistant's response to conversation history
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Claude finished — extract the JSON from the final text block
      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }
      // Strip any accidental markdown fences
      const cleaned = textBlock.text
        .replace(/^```[a-z]*\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      return JSON.parse(cleaned) as ResumeAnalysisResult;
    }

    if (response.stop_reason === "tool_use") {
      // Execute every tool call Claude requested
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        const mcpResult = await mcpClient.callTool({
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });

        const content = mcpResult.content as Array<{ type: string; text?: string }>;
        const resultText = content
          .filter((c) => c.type === "text" && typeof c.text === "string")
          .map((c) => c.text as string)
          .join("\n");

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: resultText,
        });
      }

      // Return tool results to Claude so it can continue
      messages.push({ role: "user", content: toolResults });
    }
  }
}
