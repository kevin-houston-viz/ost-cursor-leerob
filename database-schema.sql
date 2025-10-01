-- Ostly Database Schema
-- PostgreSQL schema for Opportunity Solution Tree (OST) editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- OST Trees Table
-- Stores the main OST tree information
CREATE TABLE ost_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nodes Table (adjacency list pattern)
-- Stores individual nodes in the OST hierarchy
-- Hierarchy: Outcome → Opportunity → Solution → Experiment
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES ost_trees(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('outcome', 'opportunity', 'solution', 'experiment')),
  title VARCHAR(255) NOT NULL,
  description TEXT CHECK (LENGTH(description) <= 500), -- 500 char limit
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'deprioritized', 'in_progress', 'completed')),
  color VARCHAR(7), -- hex color code (#RRGGBB)
  position_x DECIMAL(10,2), -- X coordinate for layout persistence
  position_y DECIMAL(10,2), -- Y coordinate for layout persistence
  display_order INTEGER DEFAULT 0, -- Order among siblings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

-- Version History Table
-- Uses snapshot approach for simplicity (JSONB storage)
CREATE TABLE tree_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES ost_trees(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL, -- full tree snapshot
  change_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tree_id, version_number)
);

-- Templates Table
-- Stores predefined OST templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  template_data JSONB NOT NULL, -- full template structure
  category VARCHAR(50), -- 'retention', 'engagement', 'onboarding'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_nodes_tree_id ON nodes(tree_id);
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX idx_nodes_type ON nodes(node_type);
CREATE INDEX idx_nodes_deleted_at ON nodes(deleted_at) WHERE deleted_at IS NULL; -- partial index for active nodes
CREATE INDEX idx_tree_versions_tree_id ON tree_versions(tree_id);
CREATE INDEX idx_tree_versions_created_at ON tree_versions(tree_id, created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ost_trees_updated_at BEFORE UPDATE ON ost_trees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get tree hierarchy (recursive query)
CREATE OR REPLACE FUNCTION get_tree_hierarchy(tree_uuid UUID)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  node_type VARCHAR,
  title VARCHAR,
  description TEXT,
  status VARCHAR,
  color VARCHAR,
  position_x DECIMAL,
  position_y DECIMAL,
  display_order INTEGER,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree_hierarchy AS (
    -- Base case: root nodes (no parent)
    SELECT 
      n.id, 
      n.parent_id, 
      n.node_type, 
      n.title, 
      n.description, 
      n.status, 
      n.color,
      n.position_x,
      n.position_y,
      n.display_order,
      0 as level
    FROM nodes n
    WHERE n.tree_id = tree_uuid 
      AND n.parent_id IS NULL 
      AND n.deleted_at IS NULL
    
    UNION ALL
    
    -- Recursive case: child nodes
    SELECT 
      n.id, 
      n.parent_id, 
      n.node_type, 
      n.title, 
      n.description, 
      n.status, 
      n.color,
      n.position_x,
      n.position_y,
      n.display_order,
      th.level + 1
    FROM nodes n
    INNER JOIN tree_hierarchy th ON n.parent_id = th.id
    WHERE n.tree_id = tree_uuid 
      AND n.deleted_at IS NULL
  )
  SELECT * FROM tree_hierarchy ORDER BY level, display_order;
END;
$$ LANGUAGE plpgsql;

-- Sample data comments for development
-- INSERT INTO ost_trees (title, description) VALUES ('Sample OST', 'A sample tree for testing');
-- INSERT INTO nodes (tree_id, node_type, title, description) VALUES ('<tree_id>', 'outcome', 'Increase User Retention', 'Improve 30-day retention by 15%');

