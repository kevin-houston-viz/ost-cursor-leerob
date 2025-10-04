export type NodeType = 'outcome' | 'opportunity' | 'solution' | 'experiment';
export type NodeStatus = 'draft' | 'in_progress' | 'validated' | 'deprioritized' | 'completed';

export interface OSTTree {
  id: string;
  title: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Node {
  id: string;
  tree_id: string;
  parent_id?: string;
  node_type: NodeType;
  title: string;
  description?: string;
  status: NodeStatus;
  color?: string;
  position_x?: number;
  position_y?: number;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface TreeWithNodes extends OSTTree {
  nodes: Node[];
}

export interface CreateTreeInput {
  title: string;
  description?: string;
}

export interface UpdateTreeInput {
  title?: string;
  description?: string;
}

export interface CreateNodeInput {
  tree_id: string;
  parent_id?: string;
  node_type: NodeType;
  title: string;
  description?: string;
  status?: NodeStatus;
  color?: string;
  position_x?: number;
  position_y?: number;
  display_order?: number;
}

export interface UpdateNodeInput {
  title?: string;
  description?: string;
  node_type?: NodeType;
  status?: NodeStatus;
  color?: string;
  position_x?: number;
  position_y?: number;
  display_order?: number;
}


