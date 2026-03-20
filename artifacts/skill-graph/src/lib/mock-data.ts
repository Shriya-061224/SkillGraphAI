import type { AnalysisResult } from "@workspace/api-client-react/src/generated/api.schemas";

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  candidateProfile: {
    name: "Alex Developer",
    totalYearsExperience: 4,
    topSkills: ["React", "TypeScript", "Node.js", "CSS"],
    summary: "A capable frontend developer with strong React and TypeScript fundamentals, looking to transition into a Full Stack or Senior Frontend role involving modern architectural patterns."
  },
  jobProfile: {
    role: "Senior Full Stack Engineer",
    company: "TechNova Innovators",
    requiredSkills: ["React", "TypeScript", "GraphQL", "AWS", "System Design", "CI/CD"],
    summary: "Requires a seasoned engineer capable of architecting scalable systems, building robust GraphQL APIs, and deploying on AWS infrastructure while maintaining high quality frontend code."
  },
  gapScore: 65,
  estimatedTotalHours: 120,
  nodes: [
    { id: "n-react", name: "React 18", status: "known", category: "Frontend", description: "Advanced component patterns and hooks", yearsExperience: 4 },
    { id: "n-ts", name: "TypeScript", status: "known", category: "Language", description: "Static typing and generics", yearsExperience: 3 },
    { id: "n-node", name: "Node.js", status: "known", category: "Backend", description: "Server-side JavaScript runtime", yearsExperience: 2 },
    { id: "n-gql", name: "GraphQL", status: "partial", category: "API", description: "Data query and manipulation language for APIs", yearsExperience: 0.5 },
    { id: "n-sys", name: "System Design", status: "unknown", category: "Architecture", description: "Designing scalable distributed systems", yearsExperience: null },
    { id: "n-aws", name: "AWS Services", status: "unknown", category: "Infrastructure", description: "Cloud computing and deployment", yearsExperience: null },
    { id: "n-cicd", name: "CI/CD Pipelines", status: "partial", category: "DevOps", description: "Continuous integration and delivery", yearsExperience: 1 }
  ],
  edges: [
    { source: "n-react", target: "n-gql", label: "Consumes" },
    { source: "n-ts", target: "n-node", label: "Types" },
    { source: "n-node", target: "n-gql", label: "Serves" },
    { source: "n-sys", target: "n-aws", label: "Deployed on" },
    { source: "n-node", target: "n-sys", label: "Part of" },
    { source: "n-cicd", target: "n-aws", label: "Automates" }
  ],
  learningPath: [
    {
      skillId: "n-gql",
      skillName: "GraphQL (Advanced)",
      why: "The role requires building robust GraphQL APIs, moving beyond your current partial knowledge of consuming them.",
      resources: ["Apollo Odyssey Tutorial", "GraphQL.org Docs", "Frontend Masters Advanced GraphQL"],
      estimatedHours: 20,
      miniProject: "Build a Node.js + Apollo Server API with 3 distinct domain entities and complex relational queries.",
      priority: 1
    },
    {
      skillId: "n-aws",
      skillName: "AWS Services",
      why: "Required for cloud deployment and infrastructure management, which is currently missing from your profile.",
      resources: ["AWS Cloud Practitioner Essentials", "Serverless Stack Tutorial"],
      estimatedHours: 40,
      miniProject: "Deploy your GraphQL API to AWS Lambda using Serverless Framework or AWS SAM.",
      priority: 2
    },
    {
      skillId: "n-sys",
      skillName: "System Design",
      why: "Senior roles demand the ability to architect scalable systems and understand trade-offs.",
      resources: ["ByteByteGo System Design Course", "Designing Data-Intensive Applications (Book)"],
      estimatedHours: 45,
      miniProject: "Design a scalable architecture diagram for a Twitter clone including caching, database sharding, and CDN.",
      priority: 3
    },
    {
      skillId: "n-cicd",
      skillName: "CI/CD Pipelines",
      why: "Need to formalize your partial knowledge to automate deployments efficiently.",
      resources: ["GitHub Actions Documentation", "Docker basics for CI"],
      estimatedHours: 15,
      miniProject: "Create a GitHub Action workflow that lints, tests, and builds your application on every PR.",
      priority: 4
    }
  ]
};
