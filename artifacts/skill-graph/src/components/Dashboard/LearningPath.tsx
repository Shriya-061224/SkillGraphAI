import { motion } from 'framer-motion';
import { BookOpen, Clock, Code2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { AnalysisResult } from '@workspace/api-client-react/src/generated/api.schemas';

export function LearningPath({ data }: { data: AnalysisResult }) {
  if (data.learningPath.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-display font-bold">100% Match!</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Based on the analysis, you already possess all the required skills for this role. No additional learning path is necessary.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="relative border-l-2 border-border ml-4 md:ml-6 space-y-12">
        {data.learningPath.map((step, index) => (
          <motion.div 
            key={step.skillId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="relative pl-8 md:pl-12"
          >
            {/* Timeline Dot */}
            <div className="absolute w-8 h-8 bg-card border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.5)] z-10">
              <span className="text-xs font-bold text-primary">{index + 1}</span>
            </div>

            <Card className="hover:border-primary/50 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">
                      {step.skillName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{step.estimatedHours} hours estimated</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      Priority {step.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Why you need this</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {step.why}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Recommended Resources
                      </h4>
                      <ul className="space-y-2">
                        {step.resources.map((res, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Code2 className="w-4 h-4 text-accent" />
                        Mini Project
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {step.miniProject}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
