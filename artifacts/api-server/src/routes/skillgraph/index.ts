import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  AnalyzeSkillGraphBody,
  AnalyzeSkillGraphResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert career coach and skill graph architect. Your job is to:
1. Parse resume text and job descriptions
2. Extract skills and build a knowledge graph showing dependencies between skills
3. Identify skill gaps
4. Generate an optimal learning path

When analyzing skills, think about prerequisite relationships:
- Python → Data Analysis → Machine Learning → Deep Learning
- Statistics → Machine Learning
- Linear Algebra → Neural Networks → Deep Learning
- HTML/CSS → JavaScript → React → Next.js
- SQL → Database Design → Data Warehousing
- Algorithms → System Design → Distributed Systems
- Networking → Security → Cloud Architecture

Always return valid JSON matching the exact schema requested.`;

router.post("/skillgraph/analyze", async (req, res) => {
  try {
    const body = AnalyzeSkillGraphBody.parse(req.body);
    const { resumeText, jobDescription } = body;

    const userPrompt = `Analyze the following resume and job description. Build a comprehensive skill knowledge graph.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with this exact structure:
{
  "candidateProfile": {
    "name": "candidate's name or 'Candidate'",
    "totalYearsExperience": number,
    "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "summary": "brief 1-2 sentence summary of candidate's background"
  },
  "jobProfile": {
    "role": "job title",
    "company": "company name or 'Company'",
    "requiredSkills": ["skill1", "skill2", ...],
    "summary": "brief 1-2 sentence summary of the role"
  },
  "nodes": [
    {
      "id": "unique-id",
      "name": "Skill Name",
      "status": "known" | "partial" | "unknown",
      "category": "category like Programming, Data Science, ML, Cloud, etc.",
      "description": "brief description of this skill",
      "yearsExperience": number or null
    }
  ],
  "edges": [
    {
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "prerequisite for"
    }
  ],
  "learningPath": [
    {
      "skillId": "node-id",
      "skillName": "Skill Name",
      "why": "Why this skill is needed for the role",
      "resources": ["Resource 1", "Resource 2", "Resource 3"],
      "estimatedHours": number,
      "miniProject": "A concrete mini-project to practice this skill",
      "priority": 1
    }
  ],
  "gapScore": number between 0-100 (percentage of required skills already known),
  "estimatedTotalHours": total hours to complete all learning steps
}

Rules:
- Include ALL relevant skills from both resume and job description as nodes (aim for 15-30 nodes)
- Mark skills clearly: "known" = candidate has it, "partial" = candidate has some exposure, "unknown" = candidate needs to learn
- Create edges showing prerequisite relationships (e.g., Python must be learned before Data Analysis)
- learningPath should only include "unknown" or "partial" skills, ordered by priority (prerequisites first)
- Resources should be specific (book names, course names, documentation URLs)
- Be thorough and realistic with time estimates
- gapScore: if candidate knows 7 out of 10 required skills, score is 70`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "AI_ERROR", message: "No response from AI" });
      return;
    }

    const parsed = JSON.parse(content);

    const validated = AnalyzeSkillGraphResponse.parse(parsed);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Error analyzing skill graph");
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: "PARSE_ERROR", message: "Failed to parse AI response" });
      return;
    }
    res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" });
  }
});

export default router;
