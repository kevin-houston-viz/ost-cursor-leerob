import { Router, type Request, type Response, type NextFunction } from 'express';
import { pool } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';
import { type CreateNodeInput, type UpdateNodeInput, type Node } from '../types/index.js';

const router = Router({ mergeParams: true }); // Enable access to :treeId param

// GET /api/trees/:treeId/nodes - Get all nodes for a tree
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treeId } = req.params;

    const result = await pool.query<Node>(
      `SELECT * FROM nodes 
       WHERE tree_id = $1 AND deleted_at IS NULL 
       ORDER BY display_order ASC`,
      [treeId]
    );

    res.json({ nodes: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/trees/:treeId/nodes/:nodeId - Get a single node
router.get('/:nodeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treeId, nodeId } = req.params;

    const result = await pool.query<Node>(
      `SELECT * FROM nodes 
       WHERE id = $1 AND tree_id = $2 AND deleted_at IS NULL`,
      [nodeId, treeId]
    );

    if (result.rows.length === 0) {
      throw createError('Node not found', 404);
    }

    res.json({ node: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/trees/:treeId/nodes - Create a new node
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treeId } = req.params;
    const {
      parent_id,
      node_type,
      title,
      description,
      status = 'draft',
      color,
      position_x,
      position_y,
      display_order = 0,
    }: CreateNodeInput = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      throw createError('Title is required', 400);
    }

    if (!node_type || !['outcome', 'opportunity', 'solution', 'experiment'].includes(node_type)) {
      throw createError('Invalid node type', 400);
    }

    // Verify tree exists
    const treeCheck = await pool.query('SELECT id FROM ost_trees WHERE id = $1', [treeId]);
    if (treeCheck.rows.length === 0) {
      throw createError('Tree not found', 404);
    }

    // If parent_id provided, verify it exists and belongs to this tree
    if (parent_id) {
      const parentCheck = await pool.query(
        'SELECT id FROM nodes WHERE id = $1 AND tree_id = $2 AND deleted_at IS NULL',
        [parent_id, treeId]
      );
      if (parentCheck.rows.length === 0) {
        throw createError('Parent node not found', 404);
      }
    }

    // Validate description length (500 chars max)
    if (description && description.length > 500) {
      throw createError('Description must be 500 characters or less', 400);
    }

    const result = await pool.query<Node>(
      `INSERT INTO nodes (
        tree_id, parent_id, node_type, title, description, 
        status, color, position_x, position_y, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        treeId,
        parent_id || null,
        node_type,
        title.trim(),
        description || null,
        status,
        color || null,
        position_x || null,
        position_y || null,
        display_order,
      ]
    );

    res.status(201).json({ node: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/trees/:treeId/nodes/:nodeId - Update a node
router.patch('/:nodeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treeId, nodeId } = req.params;
    const {
      title,
      description,
      node_type,
      status,
      color,
      position_x,
      position_y,
      display_order,
    }: UpdateNodeInput = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      if (title.trim().length === 0) {
        throw createError('Title cannot be empty', 400);
      }
      updates.push(`title = $${paramCount}`);
      values.push(title.trim());
      paramCount++;
    }

    if (description !== undefined) {
      if (description && description.length > 500) {
        throw createError('Description must be 500 characters or less', 400);
      }
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (node_type !== undefined) {
      if (!['outcome', 'opportunity', 'solution', 'experiment'].includes(node_type)) {
        throw createError('Invalid node type', 400);
      }
      updates.push(`node_type = $${paramCount}`);
      values.push(node_type);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (color !== undefined) {
      updates.push(`color = $${paramCount}`);
      values.push(color);
      paramCount++;
    }

    if (position_x !== undefined) {
      updates.push(`position_x = $${paramCount}`);
      values.push(position_x);
      paramCount++;
    }

    if (position_y !== undefined) {
      updates.push(`position_y = $${paramCount}`);
      values.push(position_y);
      paramCount++;
    }

    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount}`);
      values.push(display_order);
      paramCount++;
    }

    if (updates.length === 0) {
      throw createError('No updates provided', 400);
    }

    // Always update updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(nodeId, treeId);

    const result = await pool.query<Node>(
      `UPDATE nodes 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND tree_id = $${paramCount + 1} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw createError('Node not found', 404);
    }

    res.json({ node: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/trees/:treeId/nodes/:nodeId - Soft delete a node
router.delete('/:nodeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treeId, nodeId } = req.params;

    const result = await pool.query<Node>(
      `UPDATE nodes 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND tree_id = $2 AND deleted_at IS NULL 
       RETURNING id`,
      [nodeId, treeId]
    );

    if (result.rows.length === 0) {
      throw createError('Node not found', 404);
    }

    res.json({ message: 'Node deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

export default router;

