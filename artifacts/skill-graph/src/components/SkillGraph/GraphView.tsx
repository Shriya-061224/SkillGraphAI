import { useEffect, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  BackgroundVariant
} from '@xyflow/react';
import dagre from 'dagre';
import { SkillNode } from './SkillNode';
import type { AnalysisResult } from '@workspace/api-client-react/src/generated/api.schemas';

interface GraphViewProps {
  data: AnalysisResult;
}

const nodeTypes = {
  skill: SkillNode,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 240;
  const nodeHeight = 100;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function GraphView({ data }: GraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes = data.nodes.map(n => ({
      id: n.id,
      type: 'skill',
      data: n,
      position: { x: 0, y: 0 },
    }));

    const initialEdges = data.edges.map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] border border-border rounded-2xl overflow-hidden bg-background/50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="hsl(var(--border))" />
        <Controls 
          className="bg-card border-border shadow-xl rounded-lg overflow-hidden" 
          showInteractive={false}
        />
      </ReactFlow>
      
      <div className="absolute bottom-4 left-4 flex gap-3 bg-card/80 backdrop-blur-md p-3 rounded-xl border border-border shadow-lg z-10">
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-success"></div> Known
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-warning"></div> Partial
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-danger"></div> Missing
        </div>
      </div>
    </div>
  );
}
