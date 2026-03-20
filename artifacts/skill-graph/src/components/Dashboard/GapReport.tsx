import { motion } from 'framer-motion';
import { Target, Map, Activity, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AnalysisResult } from '@workspace/api-client-react/src/generated/api.schemas';

export function GapReport({ data }: { data: AnalysisResult }) {
  const isGoodFit = data.gapScore >= 70;
  const isMediumFit = data.gapScore >= 40 && data.gapScore < 70;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1 bg-gradient-to-br from-card to-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm uppercase tracking-wider">Overall Match</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-border"
              />
              <motion.circle
                initial={{ strokeDasharray: "0 440" }}
                animate={{ strokeDasharray: `${(data.gapScore / 100) * 440} 440` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                className={isGoodFit ? "text-success" : isMediumFit ? "text-warning" : "text-danger"}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-display font-bold">{data.gapScore}%</span>
              <span className="text-xs text-muted-foreground">Alignment</span>
            </div>
          </div>
          <p className="mt-6 text-center text-sm font-medium">
            Estimated <span className="text-primary">{data.estimatedTotalHours} hours</span> to bridge the gap.
          </p>
        </CardContent>
      </Card>

      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Candidate Profile</CardTitle>
            <CardDescription>{data.candidateProfile.name} • {data.candidateProfile.totalYearsExperience} YOE</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {data.candidateProfile.summary}
            </p>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Top Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {data.candidateProfile.topSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <CardTitle>Role Requirements</CardTitle>
            <CardDescription>{data.jobProfile.role} at {data.jobProfile.company}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {data.jobProfile.summary}
            </p>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Key Skills</h4>
              <div className="flex flex-wrap gap-2">
                {data.jobProfile.requiredSkills.map((skill, i) => {
                  const isKnown = data.nodes.find(n => n.name.toLowerCase() === skill.toLowerCase())?.status === 'known';
                  return (
                    <Badge key={i} variant={isKnown ? "success" : "outline"} className={isKnown ? "" : "border-border"}>
                      {skill}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
