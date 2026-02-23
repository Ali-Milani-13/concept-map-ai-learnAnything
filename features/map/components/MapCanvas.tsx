"use client";

import React from "react";
import { ReactFlow, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// Added Sparkles for the title badge
import { AlertCircle, Library, Ruler, Undo2, Download, LogIn, LogOut, CloudLightning, Loader2, Sparkles } from "lucide-react";

import AiInput from "../../ai/components/AiInput";
import Inspector from "./Inspector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SubDiagramPanel from "./SubDiagramPanel";
import Legend from "./Legend";
import HistorySidebar from "../../history/components/HistorySidebar";
import AuthModal from "../../auth/components/AuthModal";

import { THEMES } from "../hooks/useMapLayout";
import { useMapOrchestrator } from "../hooks/useMapOrchestrator";

export default function MapCanvas() {
  const orchestrator = useMapOrchestrator();

  return (
    <div className={`w-full h-screen relative overflow-hidden font-sans transition-colors duration-500 ${THEMES[orchestrator.theme].bgClass}`}>
      <AuthModal 
        isOpen={orchestrator.isAuthModalOpen} 
        onClose={() => orchestrator.setIsAuthModalOpen(false)} 
        theme={orchestrator.theme} 
        onAuthSuccess={orchestrator.handleAuthSuccess} 
      />

<div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-80 flex justify-between items-start pointer-events-none">
        
        {/* LEFT SIDE CONTROLS */}
        <div className="pointer-events-auto flex items-center gap-3">
          {orchestrator.isLoaded && (
            <button 
              onClick={() => orchestrator.setIsHistoryOpen(!orchestrator.isHistoryOpen)} 
              className={`p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 ${orchestrator.theme === "dark" ? "bg-neutral-800 text-indigo-400 hover:bg-neutral-700 border border-neutral-700" : "bg-white text-indigo-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              <Library size={20} />
              <span className="text-sm font-semibold pr-2 hidden sm:block">Library</span>
            </button>
          )}

          {/* MOVED TITLE UI: Now sits cleanly next to the Library button */}
          {orchestrator.hasMap && orchestrator.currentTopic && (
            <div className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2.5 transition-colors animate-in fade-in slide-in-from-left-4 ${
              orchestrator.theme === "dark" 
                ? "bg-neutral-800/90 border-neutral-700/50 text-indigo-100" 
                : "bg-white/90 border-gray-200/50 text-indigo-900"
            }`}>
              <Sparkles size={16} className={orchestrator.theme === "dark" ? "text-indigo-400" : "text-indigo-600"} />
              <h2 className="text-sm font-bold tracking-wide truncate max-w-32 md:max-w-xs select-none">
                {orchestrator.currentTopic}
              </h2>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-3 flex-wrap justify-end max-w-[30%] md:max-w-none">
          {orchestrator.hasMap && (
            <button 
              onClick={() => orchestrator.handleExportSVG(orchestrator.setGlobalError)} 
              title="Export as SVG" 
              className={`p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 animate-in zoom-in fade-in ${orchestrator.theme === "dark" ? "bg-neutral-800 text-sky-400 hover:bg-neutral-700 border border-neutral-700" : "bg-white text-sky-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              <Download size={20} />
              <span className="text-sm font-semibold pr-2 hidden sm:block">Export</span>
            </button>
          )}
          {orchestrator.hasMap && (
            <button 
              onClick={orchestrator.handleOrganizeMap} 
              title={orchestrator.preFormatState ? "Undo Format" : "Clean up layout"} 
              className={`p-2.5 md:p-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 animate-in zoom-in fade-in ${orchestrator.preFormatState ? orchestrator.theme === "dark" ? "bg-neutral-800 text-amber-400 hover:bg-neutral-700 border border-neutral-700" : "bg-white text-amber-600 hover:bg-gray-50 border border-gray-200" : orchestrator.theme === "dark" ? "bg-neutral-800 text-emerald-400 hover:bg-neutral-700 border border-neutral-700" : "bg-white text-emerald-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              {orchestrator.preFormatState ? <Undo2 size={20} /> : <Ruler size={20} />}
              <span className="text-sm font-semibold pr-2 hidden sm:block">{orchestrator.preFormatState ? "Undo" : "Format"}</span>
            </button>
          )}
          {orchestrator.user ? (
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className={`p-2.5 md:px-4 md:py-2.5 rounded-full shadow-xl flex items-center gap-2 border ${orchestrator.theme === "dark" ? "bg-neutral-800 border-neutral-700 text-emerald-400" : "bg-white border-gray-200 text-emerald-600"}`}>
                {orchestrator.isSyncing ? <Loader2 size={18} className="animate-spin" /> : <CloudLightning size={18} />}
                <span className="text-sm font-semibold hidden sm:block">{orchestrator.isSyncing ? "Syncing..." : "Synced to Cloud"}</span>
              </div>
              <ThemeToggle theme={orchestrator.theme} onToggle={orchestrator.toggleTheme} />
              <button 
                onClick={orchestrator.handleLogout} 
                title="Log Out" 
                className={`p-2.5 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center border ${orchestrator.theme === "dark" ? "bg-neutral-800 text-red-400 hover:bg-neutral-700 border-neutral-700" : "bg-white text-red-600 hover:bg-red-50 border-gray-200"}`}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => orchestrator.setIsAuthModalOpen(true)} 
              className={`p-2.5 md:px-4 md:py-2.5 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 border ${orchestrator.theme === "dark" ? "bg-neutral-800 text-indigo-400 hover:bg-neutral-700 border-neutral-700" : "bg-white text-indigo-600 hover:bg-gray-50 border-gray-200"}`}
            >
              <LogIn size={18} />
              <span className="text-sm font-semibold hidden sm:block">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <HistorySidebar 
        isOpen={orchestrator.isHistoryOpen} 
        theme={orchestrator.theme} 
        history={orchestrator.history} 
        currentMapId={orchestrator.currentMapId} 
        onClose={() => orchestrator.setIsHistoryOpen(false)} 
        onSelectMap={orchestrator.loadMapFromHistory} 
        onDeleteMap={orchestrator.deleteMapFromHistoryHandler} 
        onDeleteAll={orchestrator.deleteAllHistoryHandler} 
      />

      <div className="absolute inset-0 bg-size-[24px_24px] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"></div>

      {orchestrator.displayError && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-60 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-md">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{orchestrator.displayError}</span>
            <button onClick={() => { orchestrator.setGlobalError(null); orchestrator.setSyncError(null); }} className="ml-2 hover:text-red-400">✕</button>
          </div>
        </div>
      )}

      <AiInput 
        onGenerate={orchestrator.handleGenerateTrigger} 
        isGenerating={orchestrator.isGenerating} 
        hasMap={orchestrator.hasMap} 
        theme={orchestrator.theme} 
        progress={orchestrator.progress} 
      />

      <Inspector 
        selectedNode={orchestrator.selectedNode} 
        onClose={() => orchestrator.setSelectedNode(null)} 
        theme={orchestrator.theme} 
        currentTopic={orchestrator.currentTopic} 
        cachedExplanation={orchestrator.selectedNode ? orchestrator.activeHistoryItem?.explanations[orchestrator.selectedNode.data.label as string] : undefined} 
        onSaveExplanation={orchestrator.saveExplanation} 
      />

      <SubDiagramPanel 
        selectedNode={orchestrator.selectedNode} 
        currentTopic={orchestrator.currentTopic} 
        theme={orchestrator.theme} 
        onClose={() => orchestrator.setSelectedNode(null)} 
        cachedSubMap={orchestrator.selectedNode ? orchestrator.activeHistoryItem?.subMaps[orchestrator.selectedNode.data.label as string] : undefined} 
        onSaveSubMap={orchestrator.saveSubMap} 
      />

      <ReactFlow 
        onInit={orchestrator.setReactFlowInstance} 
        nodes={orchestrator.nodes} 
        edges={orchestrator.edges} 
        onNodesChange={orchestrator.onNodesChange} 
        onEdgesChange={orchestrator.onEdgesChange} 
        onConnect={orchestrator.onConnect} 
        onNodeClick={orchestrator.onNodeClick} 
        onPaneClick={orchestrator.onPaneClick} 
        colorMode={orchestrator.theme} 
        fitView 
        minZoom={0.1}
      >
        <Controls className={orchestrator.theme === "dark" ? "bg-neutral-800 border-neutral-700 fill-white" : "bg-white border-gray-200 fill-black"} />
        {orchestrator.hasMap && <MiniMap nodeColor={orchestrator.theme === "dark" ? "#3730a3" : "#c7d2fe"} maskColor={orchestrator.theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)"} className={`rounded-xl overflow-hidden border shadow-lg ${orchestrator.theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"}`} />}
        {orchestrator.hasMap && orchestrator.showLegend && <Legend theme={orchestrator.theme} onClose={() => orchestrator.setShowLegend(false)} />}
      </ReactFlow>
    </div>
  );
}