import { Router, type Request, type Response, type NextFunction } from 'express';
import { pool } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';
import { type CreateTreeInput, type UpdateTreeInput, type OSTTree, type TreeWithNodes } from '../types/index.js';

const router = Router();

// GET /api/trees - Get all trees
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query<OSTTree>(
      'SELECT * FROM ost_trees ORDER BY updated_at DESC'
    );
    res.json({ trees: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/trees/:id - Get a single tree
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query<OSTTree>(
      'SELECT * FROM ost_trees WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('Tree not found', 404);
    }

    res.json({ tree: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// GET /api/trees/:id/full - Get tree with all nodes (hierarchical)
router.get('/:id/full', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get tree
    const treeResult = await pool.query<OSTTree>(
      'SELECT * FROM ost_trees WHERE id = $1',
      [id]
    );

    if (treeResult.rows.length === 0) {
      throw createError('Tree not found', 404);
    }

    // Get all nodes for this tree (excluding soft-deleted)
    const nodesResult = await pool.query(
      `SELECT * FROM nodes 
       WHERE tree_id = $1 AND deleted_at IS NULL 
       ORDER BY display_order ASC`,
      [id]
    );

    const tree: TreeWithNodes = {
      ...treeResult.rows[0],
      nodes: nodesResult.rows,
    };

    res.json({ tree });
  } catch (error) {
    next(error);
  }
});

// POST /api/trees - Create a new tree
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description }: CreateTreeInput = req.body;

    if (!title || title.trim().length === 0) {
      throw createError('Title is required', 400);
    }

    const result = await pool.query<OSTTree>(
      `INSERT INTO ost_trees (title, description) 
       VALUES ($1, $2) 
       RETURNING *`,
      [title.trim(), description || null]
    );

    res.status(201).json({ tree: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/trees/:id - Update a tree
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description }: UpdateTreeInput = req.body;

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
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (updates.length === 0) {
      throw createError('No updates provided', 400);
    }

    // Always update updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query<OSTTree>(
      `UPDATE ost_trees 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw createError('Tree not found', 404);
    }

    res.json({ tree: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/trees/:id - Delete a tree (and all its nodes due to CASCADE)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ost_trees WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('Tree not found', 404);
    }

    res.json({ message: 'Tree deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

export default router;

