export interface ConceptNode {
  id: string;
  label: string; // The text inside the box
  summary?: string; // The AI summary (optional)
  type?: 'default' | 'input' | 'output'; // React Flow node types
}

export interface ConceptEdge {
  source: string;
  target: string;
  label?: string; // Text on the connecting line
}

export interface MapData {
  nodes: any[]; // We use 'any' for now to match React Flow's strict types later
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
}

// Matches your Supabase 'maps' table
export interface SavedMap {
  id: string;
  title: string;
  content: MapData;
  updated_at: string;
  is_public: boolean;
}