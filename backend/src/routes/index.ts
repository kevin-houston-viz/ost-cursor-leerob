import { Router } from 'express';
import treesRouter from './trees.js';
import nodesRouter from './nodes.js';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    name: 'Ostly API',
    version: '1.0.0',
    description: 'Opportunity Solution Tree (OST) editor API',
    endpoints: {
      trees: '/api/trees',
      nodes: '/api/trees/:treeId/nodes',
      health: '/health',
    },
  });
});

// Mount routes
router.use('/trees', treesRouter);
router.use('/trees/:treeId/nodes', nodesRouter);

export default router;

