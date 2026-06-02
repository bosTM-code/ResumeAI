import Anthropic from "@anthropic-ai/sdk";

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
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: `You are an expert resume reviewer and career coach specializing in Ukrainian job market.
Analyze the resume and provide scoring and feedback in Ukrainian.

Respond with ONLY a valid JSON object (no markdown, no explanation):
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
  "skills": [<skills in Ukrainian, max 20>],
  "keywords": [<keywords in Ukrainian, max 20>],
  "recommendations": [<5-8 recommendations in Ukrainian>],
  "weaknesses": [<3-5 weaknesses in Ukrainian>]
}`,
    messages: [
      {
        role: "user",
        content: `Analyze this resume and return JSON:\n\n${resumeText}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const cleaned = textBlock.text
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
  return JSON.parse(cleaned) as ResumeAnalysisResult;
}
