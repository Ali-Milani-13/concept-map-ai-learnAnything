"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  MiniMap,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import {
  AlertCircle,
  Library,
  Ruler,
  Undo2,
  Download,
  LogIn,
  LogOut,
  CloudLightning,
  Loader2,
} from "lucide-react";
import { toSvg } from "html-to-image";

// Internal Components
import AiInput from "./AiInput";
import Inspector from "./Inspector";
import ThemeToggle from "./ThemeToggle";
import SubDiagramPanel from "./SubDiagramPanel";
import Legend from "./Legend";
import HistorySidebar from "./HistorySidebar";
import AuthModal from "./AuthModal";

// Secure Server Actions
import {
  getSession,
  fetchCloudMaps,
  syncMapToCloud,
  deleteAllCloudMaps,
} from "../app/db/actions";
import { logoutUser } from "../app/auth/actions";

// --- TYPES & INTERFACES ---
type ThemeMode = "light" | "dark";

interface ThemeConfig {
  bg: string;
  color: string;
  border: string;
  edge: string;
  edgeLabel: string;
  bgClass: string;
}

interface HistoryItem {
  id: string;
  prompt: string;
  nodes: Node[];
  edges: Edge[];
  explanations: Record<string, string>;
  subMaps: Record<string, { nodes: Node[]; edges: Edge[] }>;
}

const THEMES: Record<ThemeMode, ThemeConfig> = {
  dark: {
    bg: "#1e1e24",
    color: "#ffffff",
    border: "1px solid #6366f1",
    edge: "#6366f1",
    edgeLabel: "#a5b4fc",
    bgClass: "bg-neutral-950",
  },
  light: {
    bg: "#ffffff",
    color: "#1f2937",
    border: "1px solid #4f46e5",
    edge: "#4f46e5",
    edgeLabel: "#4f46e5",
    bgClass: "bg-gray-50",
  },
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 240;
const nodeHeight = 120;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  isFormat = false,
) => {
  const ranksep = isFormat ? 300 : 200;
  const nodesep = isFormat ? 200 : 150;

  dagreGraph.setGraph({ rankdir: "TB", ranksep, nodesep, edgesep: 100 });
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
      targetPosition: "top",
      sourcePosition: "bottom",
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - nodeWidth / 2 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - nodeHeight / 2 + 150 : 0,
      },
    };
  }) as Node[];

  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: isFormat ? "straight" : edge.type || "default",
  })) as Edge[];

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export default function MapCanvas() {
  // Fix: Explicitly type our states so they don't default to never[]
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [showLegend, setShowLegend] = useState(true);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [preFormatState, setPreFormatState] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // We use 'any' here as a shortcut for the Supabase User type
  const [isSyncing, setIsSyncing] = useState(false);

  // Fix: Type the timeout interval securely
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMap = nodes.length > 0;

  const performSmartSync = async (currentLocalHistory: HistoryItem[]) => {
    setIsSyncing(true);
    try {
      const { maps: cloudMaps, error: fetchError } = await fetchCloudMaps();
      if (fetchError) throw new Error(fetchError);

      const safeCloudMaps = cloudMaps || [];
      const cloudPrompts = new Set(safeCloudMaps.map((m: any) => m.prompt));

      const localOnlyMaps = currentLocalHistory.filter(
        (m) => !cloudPrompts.has(m.prompt),
      );

      if (localOnlyMaps.length > 0) {
        for (const item of localOnlyMaps) {
          await syncMapToCloud(item);
        }
        const { maps: updatedMaps } = await fetchCloudMaps();
        setHistory((updatedMaps as HistoryItem[]) || []);
      } else {
        setHistory(safeCloudMaps as HistoryItem[]);
      }
    } catch (err: any) {
      console.error("Sync Error:", err);
      setError("Failed to sync maps with the cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    async function initializeApp() {
      const saved = localStorage.getItem("aiMapHistory");
      let localHistory: HistoryItem[] = [];
      if (saved) {
        try {
          localHistory = JSON.parse(saved);
          setHistory(localHistory);
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoaded(true);

      const activeUser = await getSession();
      if (activeUser) {
        setUser(activeUser);
        await performSmartSync(localHistory);
      }
    }

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("aiMapHistory", JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const handleAuthSuccess = async (authUser: any) => {
    setUser(authUser);
    await performSmartSync(history);
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    await logoutUser();
    setUser(null);
    setIsSyncing(false);
  };

  const handleDeleteAllHistory = async () => {
    setHistory([]);
    setNodes([]);
    setEdges([]);
    setCurrentMapId(null);
    setCurrentTopic("");
    setPreFormatState(null);

    if (user) {
      setIsSyncing(true);
      try {
        const { error: deleteError } = await deleteAllCloudMaps();
        if (deleteError) throw new Error(deleteError);
      } catch (err) {
        console.error("Failed to delete all cloud maps:", err);
        setError("Failed to delete maps from cloud.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleOrganizeMap = useCallback(() => {
    if (preFormatState) {
      setNodes(preFormatState.nodes);
      setEdges(preFormatState.edges);
      setPreFormatState(null);
    } else {
      setPreFormatState({ nodes, edges });
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, true);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
    setTimeout(() => {
      if (reactFlowInstance)
        reactFlowInstance.fitView({ duration: 800, padding: 0.2 });
    }, 50);
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance, preFormatState]);

  const handleExportSVG = useCallback(() => {
    if (!hasMap || !reactFlowInstance) return;
    reactFlowInstance.fitView({ duration: 0, padding: 0.2 });
    setTimeout(() => {
      // Fix: Cast explicitly to HTMLElement for html-to-image
      const flowElement = document.querySelector(".react-flow") as HTMLElement;
      if (!flowElement) return;

      toSvg(flowElement, {
        backgroundColor: THEMES[theme].bg,
        filter: (node) => {
          if (
            node?.classList?.contains("react-flow__minimap") ||
            node?.classList?.contains("react-flow__controls")
          ) {
            return false;
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const a = document.createElement("a");
          const safeFileName = currentTopic
            ? currentTopic.replace(/[^a-z0-9]/gi, "-").toLowerCase()
            : "concept-map";
          a.setAttribute("download", `${safeFileName}.svg`);
          a.setAttribute("href", dataUrl);
          a.click();
        })
        .catch((err) => {
          console.error("Export Error:", err);
          setError("Failed to export diagram as SVG.");
        });
    }, 100);
  }, [reactFlowInstance, theme, currentTopic, hasMap]);

  const loadMapFromHistory = (id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      setPreFormatState(null);
      const styles = THEMES[theme];
      const themedNodes = item.nodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          background: styles.bg,
          color: styles.color,
          border: styles.border,
        },
      }));

      const validHistoryNodeIds = new Set(themedNodes.map((n) => String(n.id)));
      const historySeenTargets = new Set();

      const themedEdges = item.edges
        .map((edge) => ({
          ...edge,
          source: String(edge.source),
          target: String(edge.target),
        }))
        .filter((e) => {
          if (
            !e.source ||
            !e.target ||
            e.source === e.target ||
            !validHistoryNodeIds.has(e.source) ||
            !validHistoryNodeIds.has(e.target)
          ) {
            return false;
          }
          if (historySeenTargets.has(e.target)) {
            return false;
          }
          historySeenTargets.add(e.target);
          return true;
        })
        .map((edge) => ({
          ...edge,
          type: "default",
          style: { ...edge.style, stroke: styles.edge },
          markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
          labelStyle: { ...(edge.labelStyle || {}), fill: styles.edgeLabel },
        })) as Edge[];

      setNodes(themedNodes);
      setEdges(themedEdges);
      setCurrentTopic(item.prompt);
      setCurrentMapId(item.id);
      setSelectedNode(null);
      setIsHistoryOpen(false);
      setShowLegend(true);
      setTimeout(
        () => reactFlowInstance?.fitView({ duration: 800, padding: 0.2 }),
        100,
      );
    }
  };

  const deleteMapFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (currentMapId === id) {
      setNodes([]);
      setEdges([]);
      setCurrentMapId(null);
      setCurrentTopic("");
      setPreFormatState(null);
    }
  };

  const saveExplanation = (nodeLabel: string, text: string) => {
    if (!currentMapId) return;
    setHistory((prev) =>
      prev.map((h) =>
        h.id === currentMapId
          ? { ...h, explanations: { ...h.explanations, [nodeLabel]: text } }
          : h,
      ),
    );
  };

  const saveSubMap = (
    nodeLabel: string,
    subNodes: Node[],
    subEdges: Edge[],
  ) => {
    if (!currentMapId) return;
    setHistory((prev) =>
      prev.map((h) =>
        h.id === currentMapId
          ? {
              ...h,
              subMaps: {
                ...h.subMaps,
                [nodeLabel]: { nodes: subNodes, edges: subEdges },
              },
            }
          : h,
      ),
    );
  };

  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    const styles = THEMES[newTheme];
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          background: styles.bg,
          color: styles.color,
          border: styles.border,
        },
      })),
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: { ...edge.style, stroke: styles.edge },
        markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
        labelStyle: { ...(edge.labelStyle || {}), fill: styles.edgeLabel },
      })),
    );
  }, [theme, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNode(node),
    [],
  );
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    setSelectedNode(null);
    setProgress(0);
    setCurrentTopic(prompt);
    setShowLegend(true);
    setPreFormatState(null);

    progressInterval.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : Math.min(p + (p < 50 ? 5 : 2), 90)));
    }, 150);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok)
        throw new Error(`Network Error: ${res.status} ${res.statusText}`);
      const data = await res.json();

      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);

      if (data.nodes && data.edges) {
        const styles = THEMES[theme];

        const rawNodes = data.nodes.map((node: any) => ({
          id: String(node.id),
          type: "default",
          data: { label: node.label, summary: node.summary },
          position: { x: 0, y: 0 },
          style: {
            background: styles.bg,
            color: styles.color,
            border: styles.border,
            borderRadius: "12px",
            padding: "16px",
            width: 220,
            fontSize: "15px",
            fontWeight: "600",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          },
        })) as Node[];

        const validNodeIds = new Set(rawNodes.map((n) => n.id));
        const seenTargets = new Set();

        const rawEdges = data.edges
          .map((edge: any) => ({
            ...edge,
            source: String(edge.source),
            target: String(edge.target),
          }))
          .filter((e: any) => {
            if (
              !e.source ||
              !e.target ||
              e.source === e.target ||
              !validNodeIds.has(e.source) ||
              !validNodeIds.has(e.target)
            )
              return false;
            if (seenTargets.has(e.target)) return false;
            seenTargets.add(e.target);
            return true;
          })
          .map((edge: any, index: number) => ({
            ...edge,
            id: `e-${edge.source}-${edge.target}-${index}`,
            type: "default",
            markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
            style: { stroke: styles.edge, strokeWidth: 2, opacity: 0.6 },
            animated: true,
            labelStyle: {
              fill: styles.edgeLabel,
              fontWeight: 500,
              fontSize: 12,
            },
          })) as Edge[];

        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
          rawNodes,
          rawEdges,
          false,
        );
        setNodes(lNodes);
        setEdges(lEdges);

        const newId = Date.now().toString();
        setCurrentMapId(newId);

        const newItem: HistoryItem = {
          id: newId,
          prompt,
          nodes: lNodes,
          edges: lEdges,
          explanations: {},
          subMaps: {},
        };

        setHistory((prev) => [newItem, ...prev]);

        if (user) {
          syncMapToCloud(newItem).then((res) => {
            if (res && res.error)
              console.error("Failed to sync new map:", res.error);
          });
        }

        setTimeout(
          () => reactFlowInstance?.fitView({ duration: 800, padding: 0.2 }),
          100,
        );
      }
    } catch (err: any) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(0);
      setError(err.message || "Failed to connect to server");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        if (!error) setProgress(0);
      }, 500);
    }
  };

  const activeHistoryItem = history.find((h) => h.id === currentMapId);

  return (
    <div
      className={`w-full h-screen relative overflow-hidden font-sans transition-colors duration-500 ${THEMES[theme].bgClass}`}
    >
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        theme={theme}
        onAuthSuccess={handleAuthSuccess}
      />

      <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-80 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          {isLoaded && (
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 ${theme === "dark" ? "bg-neutral-800 text-indigo-400 hover:bg-neutral-700 border border-neutral-700" : "bg-white text-indigo-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              <Library size={20} />
              <span className="text-sm font-semibold pr-2 hidden sm:block">
                Library
              </span>
            </button>
          )}
        </div>

        {/* FIX: Reduced gaps and made items wrap safely if screen is ultra-tiny */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-3 flex-wrap justify-end max-w-[75%] md:max-w-none">
          {hasMap && (
            <button
              onClick={handleExportSVG}
              title="Export as SVG"
              className={`p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 animate-in zoom-in fade-in ${theme === "dark" ? "bg-neutral-800 text-sky-400 hover:bg-neutral-700 border border-neutral-700" : "bg-white text-sky-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              <Download size={20} />
              <span className="text-sm font-semibold pr-2 hidden sm:block">
                Export
              </span>
            </button>
          )}

          {hasMap && (
            <button
              onClick={handleOrganizeMap}
              title={preFormatState ? "Undo Format" : "Clean up layout"}
              className={`p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 animate-in zoom-in fade-in ${
                preFormatState
                  ? theme === "dark"
                    ? "bg-neutral-800 text-amber-400 hover:bg-neutral-700 border border-neutral-700"
                    : "bg-white text-amber-600 hover:bg-gray-50 border border-gray-200"
                  : theme === "dark"
                    ? "bg-neutral-800 text-emerald-400 hover:bg-neutral-700 border border-neutral-700"
                    : "bg-white text-emerald-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {preFormatState ? <Undo2 size={20} /> : <Ruler size={20} />}
              <span className="text-sm font-semibold pr-2 hidden sm:block">
                {preFormatState ? "Undo" : "Format"}
              </span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-1.5 md:gap-2">
              <div
                className={`p-2.5 md:px-4 md:py-2.5 rounded-full shadow-xl flex items-center gap-2 border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-emerald-400" : "bg-white border-gray-200 text-emerald-600"}`}
              >
                {isSyncing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CloudLightning size={18} />
                )}
                <span className="text-sm font-semibold hidden sm:block">
                  {isSyncing ? "Syncing..." : "Synced to Cloud"}
                </span>
              </div>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              <button
                onClick={handleLogout}
                title="Log Out"
                className={`p-2.5 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center border ${theme === "dark" ? "bg-neutral-800 text-red-400 hover:bg-neutral-700 border-neutral-700" : "bg-white text-red-600 hover:bg-red-50 border-gray-200"}`}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`p-2.5 md:px-4 md:py-2.5 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 border ${theme === "dark" ? "bg-neutral-800 text-indigo-400 hover:bg-neutral-700 border-neutral-700" : "bg-white text-indigo-600 hover:bg-gray-50 border-gray-200"}`}
            >
              <LogIn size={18} />
              <span className="text-sm font-semibold hidden sm:block">
                Sign In
              </span>
            </button>
          )}
        </div>
      </div>

      <HistorySidebar
        isOpen={isHistoryOpen}
        theme={theme}
        history={history}
        currentMapId={currentMapId}
        onClose={() => setIsHistoryOpen(false)}
        onSelectMap={loadMapFromHistory}
        onDeleteMap={deleteMapFromHistory}
        onDeleteAll={handleDeleteAllHistory}
      />

      <div
        className={`absolute inset-0 bg-size-[24px_24px] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]`}
      ></div>

      {error && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-60 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-md">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <AiInput
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasMap={hasMap}
        theme={theme}
        progress={progress}
      />

      <Inspector
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
        theme={theme}
        currentTopic={currentTopic}
        cachedExplanation={
          selectedNode
            ? activeHistoryItem?.explanations[selectedNode.data.label as string]
            : undefined
        }
        onSaveExplanation={saveExplanation}
      />

      <SubDiagramPanel
        selectedNode={selectedNode}
        currentTopic={currentTopic}
        theme={theme}
        onClose={() => setSelectedNode(null)}
        cachedSubMap={
          selectedNode
            ? activeHistoryItem?.subMaps[selectedNode.data.label as string]
            : undefined
        }
        onSaveSubMap={saveSubMap}
      />

      <ReactFlow
        onInit={setReactFlowInstance}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        colorMode={theme}
        fitView
        minZoom={0.1}
      >
        <Controls
          className={
            theme === "dark"
              ? "bg-neutral-800 border-neutral-700 fill-white"
              : "bg-white border-gray-200 fill-black"
          }
        />
        {hasMap && (
          <MiniMap
            nodeColor={theme === "dark" ? "#3730a3" : "#c7d2fe"}
            maskColor={
              theme === "dark"
                ? "rgba(0, 0, 0, 0.7)"
                : "rgba(255, 255, 255, 0.7)"
            }
            className={`rounded-xl overflow-hidden border shadow-lg ${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"}`}
          />
        )}
        {hasMap && showLegend && (
          <Legend theme={theme} onClose={() => setShowLegend(false)} />
        )}
      </ReactFlow>
    </div>
  );
}
