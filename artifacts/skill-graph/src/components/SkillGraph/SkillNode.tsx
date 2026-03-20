import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SkillNode as SkillNodeType } from '@workspace/api-client-react/src/generated/api.schemas';

export const SkillNode = memo(({ data, isConnectable }: NodeProps<SkillNodeType>) => {
  const isKnown = data.status === 'known';
  const isPartial = data.status === 'partial';
  const isUnknown = data.status === 'unknown';

  return (
    <div className={cn(
      "px-5 py-3 rounded-xl shadow-xl border-2 backdrop-blur-md min-w-[200px] transition-all duration-300 hover:-translate-y-1 cursor-pointer",
      isKnown && "bg-success/10 border-success/40 shadow-success/10",
      isPartial && "bg-warning/10 border-warning/40 shadow-warning/10",
      isUnknown && "bg-danger/10 border-danger/40 shadow-danger/10"
    )}>
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        className="w-3 h-3 bg-muted-foreground border-2 border-background"
      />
      
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-foreground text-sm">
            {data.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {data.category}
          </p>
        </div>
        
        <div className="shrink-0 mt-0.5">
          {isKnown && <CheckCircle2 className="w-5 h-5 text-success" />}
          {isPartial && <AlertCircle className="w-5 h-5 text-warning" />}
          {isUnknown && <XCircle className="w-5 h-5 text-danger" />}
        </div>
      </div>
      
      {data.yearsExperience !== null && data.yearsExperience !== undefined && (
        <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground font-medium">
          {data.yearsExperience} yr{data.yearsExperience !== 1 && 's'} exp
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-3 h-3 bg-muted-foreground border-2 border-background"
      />
    </div>
  );
});

SkillNode.displayName = 'SkillNode';
