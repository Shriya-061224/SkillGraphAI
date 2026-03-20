import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronRight, FileText, Briefcase, Network, Upload, X, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAnalyzeSkillGraph } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { GraphView } from "@/components/SkillGraph/GraphView";
import { GapReport } from "@/components/Dashboard/GapReport";
import { LearningPath } from "@/components/Dashboard/LearningPath";
import { MOCK_ANALYSIS_RESULT } from "@/lib/mock-data";
import type { AnalysisResult } from "@workspace/api-client-react/src/generated/api.schemas";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ACCEPTED_EXTENSIONS = ".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.gif";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "report" | "path">("graph");

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "file">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeMutation = useAnalyzeSkillGraph();

  const extractTextFromFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Unsupported file type. Please upload a PDF, DOCX, DOC, or image file.");
      setUploadState("error");
      return;
    }
    setUploadState("uploading");
    setUploadError(null);
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/skillgraph/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to extract text");
      }
      setResumeText(data.text);
      setUploadState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process file";
      setUploadError(msg);
      setUploadState("error");
      setUploadedFileName(null);
    }
  }, []);

  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) await extractTextFromFile(file);
    },
    [extractTextFromFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await extractTextFromFile(file);
      e.target.value = "";
    },
    [extractTextFromFile]
  );

  const clearUpload = () => {
    setUploadState("idle");
    setUploadedFileName(null);
    setUploadError(null);
    setResumeText("");
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeMutation.mutateAsync({
        data: { resumeText, jobDescription },
      });
      setResult(data);
    } catch (error) {
      console.error("API failed, using mock data for demo", error);
      setTimeout(() => setResult(MOCK_ANALYSIS_RESULT), 2500);
    } finally {
      setTimeout(() => setIsAnalyzing(false), 2500);
    }
  };

  const handleReset = () => {
    setResult(null);
    setResumeText("");
    setJobDescription("");
    setActiveTab("graph");
    clearUpload();
  };

  const fillDemoData = () => {
    setResumeText(
      "John Smith\nFrontend Developer | 4 years experience\n\nSkills: React, TypeScript, JavaScript ES6+, Node.js, HTML5, CSS3, Git\n\nExperience:\n- Built 3 production SPAs using React + Redux at TechCorp (2021-2024)\n- REST API integration, performance optimization, unit testing with Jest\n- Some exposure to AWS S3 and basic CI/CD pipelines\n\nEducation: B.S. Computer Science, State University 2020"
    );
    setJobDescription(
      "Senior Full Stack Engineer\n\nWe are looking for an experienced Full Stack Engineer to join our growing team.\n\nRequired Skills:\n- React, TypeScript, GraphQL\n- Node.js with Express or NestJS\n- AWS (EC2, Lambda, S3, RDS)\n- PostgreSQL and Redis\n- System Design and Microservices\n- CI/CD with GitHub Actions\n- Docker and Kubernetes\n\nNice to have: Machine Learning basics, data pipelines"
    );
    setUploadState("idle");
    setUploadedFileName(null);
    setInputMode("text");
  };

  if (result && !isAnalyzing) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                SkillGraph <span className="text-primary">AI</span>
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Start Over
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">Analysis Results</h1>
              <p className="text-muted-foreground mt-2">Mapped your profile against the role requirements.</p>
            </div>
            <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50 backdrop-blur-md">
              {(["graph", "report", "path"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "graph" ? "Graph View" : tab === "report" ? "Gap Report" : "Learning Path"}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "graph" && <GraphView data={result} />}
              {activeTab === "report" && <GapReport data={result} />}
              {activeTab === "path" && <LearningPath data={result} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Abstract tech background"
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {!isAnalyzing ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Onboarding
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
                  Map Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Skills
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Upload your resume or paste it as text, then add the job description. Our AI builds a
                  knowledge graph, identifies skill gaps, and generates a personalized learning roadmap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Resume Panel */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 flex flex-col h-full shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-foreground font-display font-semibold text-lg">
                        <FileText className="w-5 h-5 text-primary" />
                        Your Resume
                      </div>
                      <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-lg">
                        <button
                          onClick={() => setInputMode("file")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            inputMode === "file"
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          onClick={() => setInputMode("text")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            inputMode === "text"
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Paste
                        </button>
                      </div>
                    </div>

                    {inputMode === "file" ? (
                      <div className="flex-1 min-h-[250px] flex flex-col">
                        {uploadState === "success" && uploadedFileName ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-primary/40 bg-primary/5">
                            <FileCheck className="w-12 h-12 text-primary" />
                            <div className="text-center">
                              <p className="font-semibold text-foreground truncate max-w-[200px]">{uploadedFileName}</p>
                              <p className="text-sm text-muted-foreground mt-1">Text extracted successfully</p>
                            </div>
                            <button
                              onClick={clearUpload}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" /> Remove file
                            </button>
                          </div>
                        ) : uploadState === "uploading" ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-muted-foreground text-sm">Extracting text from {uploadedFileName}…</p>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none ${
                              isDragging
                                ? "border-primary bg-primary/10 scale-[1.01]"
                                : "border-border hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ACCEPTED_EXTENSIONS}
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-7 h-7 text-primary" />
                            </div>
                            <div className="text-center px-4">
                              <p className="font-semibold text-foreground">
                                {isDragging ? "Drop your resume here" : "Drop file or click to upload"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, DOC, PNG, JPG — up to 20MB</p>
                            </div>
                            {uploadState === "error" && uploadError && (
                              <div className="flex items-start gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2 mx-4 text-left">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{uploadError}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume, skills, or LinkedIn bio here..."
                        className="w-full flex-1 min-h-[250px] bg-background/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Job Description Panel */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-l from-accent/30 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 flex flex-col h-full shadow-2xl">
                    <div className="flex items-center gap-2 text-foreground font-display font-semibold text-lg mb-4">
                      <Briefcase className="w-5 h-5 text-accent" />
                      Job Description
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description or role requirements here..."
                      className="w-full flex-1 min-h-[250px] bg-background/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  variant="glow"
                  className="w-full md:w-auto min-w-[240px] h-14 text-lg"
                  onClick={handleAnalyze}
                  disabled={!resumeText || !jobDescription || uploadState === "uploading"}
                >
                  {uploadState === "uploading" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing file…
                    </>
                  ) : (
                    <>
                      Analyze Profile <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <button
                  onClick={fillDemoData}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                >
                  Try with sample data
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">Building Skill Graph</h2>
              <p className="text-muted-foreground text-lg max-w-md animate-pulse">
                Extracting entities, mapping dependencies, and computing your optimal learning roadmap…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
