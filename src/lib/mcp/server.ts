import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const ATS_KEYWORDS: Record<string, string[]> = {
  frontend: ["React", "JavaScript", "TypeScript", "CSS", "HTML", "responsive design", "REST API", "Git", "Webpack", "performance optimization"],
  backend: ["Node.js", "Python", "Java", "Go", "REST API", "GraphQL", "PostgreSQL", "MongoDB", "Docker", "microservices"],
  "data scientist": ["Python", "R", "machine learning", "TensorFlow", "PyTorch", "pandas", "NumPy", "SQL", "data visualization", "statistical analysis"],
  "project manager": ["Agile", "Scrum", "Kanban", "JIRA", "risk management", "stakeholder communication", "budget planning", "KPI", "roadmap", "team leadership"],
  designer: ["Figma", "Adobe XD", "UX research", "user testing", "prototyping", "design system", "accessibility", "typography", "wireframing"],
  devops: ["Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "GCP", "Terraform", "monitoring", "Linux", "automation"],
};

const DEFAULT_KEYWORDS = ["leadership", "communication", "problem-solving", "teamwork", "project management", "analytical thinking"];

const SCORING_CRITERIA = {
  overall: { excellent: "80–100", good: "60–79", poor: "0–59" },
  structure: {
    description: "Layout, formatting, visual hierarchy, readability",
    excellent: "Clean sections, consistent formatting, proper whitespace, easy to scan in 6 seconds",
    good: "Mostly organized, minor formatting inconsistencies",
    poor: "Hard to read, no clear sections, inconsistent formatting",
  },
  contact: {
    description: "Completeness of contact information",
    excellent: "Name, phone, email, city, LinkedIn, GitHub or portfolio link",
    good: "Name, phone, email only",
    poor: "Missing essential contact info like email or phone",
  },
  experience: {
    description: "Work history relevance, achievement focus, quantified results",
    excellent: "Relevant roles with quantified achievements (%, numbers, time savings), strong action verbs",
    good: "Relevant experience but lacks quantification",
    poor: "Only job duties listed or experience is irrelevant",
  },
  education: {
    description: "Relevance and completeness of academic background",
    excellent: "Relevant degree + GPA if high + awards + academic projects",
    good: "Relevant degree without extras",
    poor: "No education section or highly irrelevant field",
  },
  skills: {
    description: "Technical and soft skills match to job market",
    excellent: "In-demand technical skills with proficiency levels + relevant soft skills",
    good: "Relevant skills listed without proficiency levels",
    poor: "Generic, outdated, or skills do not match the job market",
  },
};

const IMPROVEMENT_TIPS = {
  experience: [
    "Start each bullet with a strong action verb: Led, Built, Increased, Reduced, Designed",
    "Quantify every achievement: 'Increased sales by 30%' not 'Improved sales'",
    "Focus on impact and outcomes, not just job duties",
    "Keep only last 10 years; earlier roles can be condensed to one line",
    "Mirror keywords from the target job description in your bullet points",
  ],
  education: [
    "Include GPA if it is 3.5 or higher (or equivalent in local scale)",
    "List relevant coursework and academic projects",
    "Add scholarships, honors, or awards",
    "For recent graduates, put Education before Experience",
    "Include thesis or research work if it is relevant to the target role",
  ],
  skills: [
    "Group skills into categories: Languages, Frameworks, Tools, Soft Skills",
    "Add proficiency levels: Expert, Intermediate, Beginner",
    "Remove outdated technologies (Flash, Internet Explorer-specific APIs)",
    "Match your skills list to keywords in the job description",
    "Do not list more than 20 skills — quality over quantity",
  ],
  contact: [
    "Use a professional email: firstname.lastname@gmail.com",
    "Customize your LinkedIn URL to include your name",
    "Add GitHub or portfolio link if you have one",
    "Include city and country — full street address is unnecessary",
    "Use only one phone number (mobile)",
  ],
  structure: [
    "Use a single-column layout for ATS compatibility",
    "Keep consistent font sizes: name 18–24pt, headings 12–14pt, body 10–11pt",
    "Use consistent date formatting throughout: Jan 2022 – Mar 2024",
    "Add clear section headers: Experience, Education, Skills, Contact",
    "Limit to 1 page if under 5 years of experience, maximum 2 pages",
  ],
  general: [
    "Tailor your resume for each application — one generic resume will not work",
    "Use ATS-friendly keywords from the job description",
    "Save as PDF unless the employer specifically requests Word format",
    "Have someone proofread for grammar and spelling mistakes",
    "File name should be professional: Firstname_Lastname_CV.pdf",
  ],
};

function getKeywordsForField(field: string): string[] {
  const lower = field.toLowerCase();
  for (const [key, keywords] of Object.entries(ATS_KEYWORDS)) {
    if (lower.includes(key)) return keywords;
  }
  return DEFAULT_KEYWORDS;
}

export function createResumeServer() {
  const server = new Server(
    { name: "resume-ai-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_ats_keywords",
        description:
          "Get ATS-relevant keywords for a specific job field. Use this to check if the resume includes the right industry keywords.",
        inputSchema: {
          type: "object" as const,
          properties: {
            field: {
              type: "string",
              description: "Job field or title, e.g. 'Frontend Developer', 'Data Scientist', 'Project Manager'",
            },
          },
          required: ["field"],
        },
      },
      {
        name: "get_scoring_criteria",
        description:
          "Get the detailed scoring criteria and thresholds used to evaluate each resume section. Use this before scoring to ensure consistent evaluation.",
        inputSchema: {
          type: "object" as const,
          properties: {},
          required: [],
        },
      },
      {
        name: "get_improvement_tips",
        description:
          "Get specific, actionable improvement tips for a particular resume section.",
        inputSchema: {
          type: "object" as const,
          properties: {
            section: {
              type: "string",
              enum: ["experience", "education", "skills", "contact", "structure", "general"],
              description: "The resume section to get improvement tips for",
            },
          },
          required: ["section"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    if (name === "get_ats_keywords") {
      const field = String(args.field ?? "");
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ field, keywords: getKeywordsForField(field) }),
          },
        ],
      };
    }

    if (name === "get_scoring_criteria") {
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(SCORING_CRITERIA) },
        ],
      };
    }

    if (name === "get_improvement_tips") {
      const section = String(args.section ?? "general") as keyof typeof IMPROVEMENT_TIPS;
      const tips = IMPROVEMENT_TIPS[section] ?? IMPROVEMENT_TIPS.general;
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ section, tips }) },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  });

  return server;
}
