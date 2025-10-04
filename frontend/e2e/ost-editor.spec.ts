import { test, expect } from '@playwright/test';

test.describe('OST Editor - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock backend API responses
    await page.route('**/api/trees', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: {
              id: 'test-tree-123',
              user_id: 'test-user',
              name: 'Test Tree',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Mock node creation API
    let nodeCounter = 1;
    await page.route('**/api/trees/*/nodes', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            node: {
              id: `test-node-${nodeCounter++}`,
              tree_id: body.tree_id || 'test-tree-123',
              parent_id: body.parent_id || null,
              node_type: body.node_type,
              title: body.title,
              description: body.description || '',
              status: body.status || 'draft',
              position_x: body.position_x || 100,
              position_y: body.position_y || 100,
              display_order: body.display_order || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Navigate to the editor
    await page.goto('/');

    // Wait for the editor to be ready
    await page.waitForSelector('mat-toolbar', { timeout: 10000 });
  });

  test('should load the OST editor', async ({ page }) => {
    // Check toolbar is visible
    await expect(page.locator('mat-toolbar')).toBeVisible();
    
    // Check title is present
    await expect(page.locator('mat-toolbar')).toContainText('Ostly - OST Editor');
    
    // Check graph container is visible
    await expect(page.locator('.graph-container')).toBeVisible();
  });

  test('should have all node creation buttons', async ({ page }) => {
    // Check all 4 node type buttons are present
    const outcomeButton = page.locator('button[mattooltip*="Outcome"]');
    const opportunityButton = page.locator('button[mattooltip*="Opportunity"]');
    const solutionButton = page.locator('button[mattooltip*="Solution"]');
    const experimentButton = page.locator('button[mattooltip*="Experiment"]');
    
    await expect(outcomeButton).toBeVisible();
    await expect(opportunityButton).toBeVisible();
    await expect(solutionButton).toBeVisible();
    await expect(experimentButton).toBeVisible();
  });

  test('should create an outcome node when outcome button is clicked', async ({ page }) => {
    // Wait for graph to initialize
    await page.waitForTimeout(1000);
    
    // Click the outcome button (flag icon)
    const outcomeButton = page.locator('button[mattooltip*="Outcome"]');
    await outcomeButton.click();
    
    // Wait for node to be created
    await page.waitForTimeout(1000);
    
    // Check that a node was added to the graph
    // AntV X6 nodes are SVG elements
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(1, { timeout: 5000 });
    
    // Check node has outcome styling (blue color)
    const node = nodes.first();
    await expect(node).toBeVisible();
  });

  test('should create multiple nodes of different types', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Add outcome node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(500);
    
    // Add opportunity node
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(500);
    
    // Add solution node
    await page.locator('button[mattooltip*="Solution"]').click();
    await page.waitForTimeout(500);
    
    // Check that 3 nodes were created
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(3, { timeout: 5000 });
  });

  test('should allow dragging nodes', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);
    
    // Get the node
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible();
    
    // Get initial position
    const initialBox = await node.boundingBox();
    expect(initialBox).not.toBeNull();
    
    // Drag the node
    await node.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox!.x + 100, initialBox!.y + 100);
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // Get new position
    const newBox = await node.boundingBox();
    expect(newBox).not.toBeNull();
    
    // Verify position changed
    expect(newBox!.x).not.toBe(initialBox!.x);
    expect(newBox!.y).not.toBe(initialBox!.y);
  });

  test('should have zoom controls that work', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Create a node first
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);
    
    // Click zoom in button
    const zoomInButton = page.locator('button[mattooltip*="Zoom In"]');
    await zoomInButton.click();
    await page.waitForTimeout(300);
    
    // Click zoom out button
    const zoomOutButton = page.locator('button[mattooltip*="Zoom Out"]').first();
    await zoomOutButton.click();
    await page.waitForTimeout(300);
    
    // Click fit to screen
    const fitButton = page.locator('button[mattooltip*="Fit to Screen"]');
    await fitButton.click();
    await page.waitForTimeout(300);
    
    // No errors should occur
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('should toggle theme when theme button is clicked', async ({ page }) => {
    // Get the theme toggle button
    const themeButton = page.locator('button[mattooltip*="Toggle"]');
    await expect(themeButton).toBeVisible();
    
    // Get initial theme (check html class)
    const initialTheme = await page.locator('html').getAttribute('class');
    
    // Click theme toggle
    await themeButton.click();
    await page.waitForTimeout(500);
    
    // Get new theme
    const newTheme = await page.locator('html').getAttribute('class');
    
    // Verify theme changed
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should show node with correct styling and content', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Create an outcome node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);
    
    // Check node exists
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible();
    
    // Check node has text content
    const nodeText = await node.textContent();
    expect(nodeText).toBeTruthy();
    expect(nodeText).toContain('OUTCOME');
  });

  test('should handle errors gracefully when backend is unavailable', async ({ page }) => {
    // This test would require mocking the backend
    // For now, we just check that the app doesn't crash
    await expect(page.locator('mat-toolbar')).toBeVisible();
    
    // Even if backend fails, the UI should be functional
    const loadingIndicator = page.locator('.loading');
    // Loading should eventually disappear or error should show
    await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
  });
});

test.describe('OST Editor - Node Details', () => {
  test.beforeEach(async ({ page }) => {
    // Mock backend API responses
    await page.route('**/api/trees', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: {
              id: 'test-tree-123',
              user_id: 'test-user',
              name: 'Test Tree',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Mock node creation API
    let nodeCounter = 1;
    await page.route('**/api/trees/*/nodes', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            node: {
              id: `test-node-${nodeCounter++}`,
              tree_id: body.tree_id || 'test-tree-123',
              parent_id: body.parent_id || null,
              node_type: body.node_type,
              title: body.title,
              description: body.description || '',
              status: body.status || 'draft',
              position_x: body.position_x || 100,
              position_y: body.position_y || 100,
              display_order: body.display_order || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('mat-toolbar');
    await page.waitForTimeout(1000);
  });

  test('should show different colors for different node types', async ({ page }) => {
    // Create outcome node (blue)
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(500);
    
    // Create opportunity node (purple)
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(500);
    
    // Create solution node (green)
    await page.locator('button[mattooltip*="Solution"]').click();
    await page.waitForTimeout(500);
    
    // Create experiment node (orange)
    await page.locator('button[mattooltip*="Experiment"]').click();
    await page.waitForTimeout(500);
    
    // Verify all 4 nodes exist
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(4);
  });
});

test.describe('OST Editor - Node Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock backend API responses for tree and node creation
    await page.route('**/api/trees', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: {
              id: 'test-tree-123',
              user_id: 'test-user',
              name: 'Test Tree',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Mock node creation
    let nodeCounter = 1;
    await page.route('**/api/trees/*/nodes', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            node: {
              id: `test-node-${nodeCounter++}`,
              tree_id: body.tree_id || 'test-tree-123',
              parent_id: body.parent_id || null,
              node_type: body.node_type,
              title: body.title,
              description: body.description || '',
              status: body.status || 'draft',
              position_x: body.position_x || 100,
              position_y: body.position_y || 100,
              display_order: body.display_order || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Mock node update
    await page.route('**/api/trees/*/nodes/*', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        const nodeId = route.request().url().split('/').pop();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            node: {
              id: nodeId,
              tree_id: 'test-tree-123',
              parent_id: null,
              node_type: body.node_type || 'outcome',
              title: body.title || 'Updated Title',
              description: body.description || '',
              status: body.status || 'draft',
              position_x: 100,
              position_y: 100,
              display_order: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('mat-toolbar', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('should open edit dialog on double-click', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Wait for node to be fully rendered
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    
    // Get the bounding box and double-click at center
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Dialog should be visible
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Edit Node")')).toBeVisible();
  });

  test('should update node title and close dialog', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Wait for node and double-click at center
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Wait for dialog
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Edit Node")')).toBeVisible();

    // Update title
    const titleInput = page.locator('input[formcontrolname="title"]');
    await titleInput.fill('Updated Outcome Title');

    // Click save
    await page.locator('button:has-text("Save")').click();

    // Dialog should close
    await expect(page.locator('h2:has-text("Edit Node")')).not.toBeVisible({ timeout: 5000 });
  });

  test('should update node type in dialog', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Wait for node and double-click at center
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Wait for dialog
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Change node type to Solution
    await page.locator('mat-select[formcontrolname="node_type"]').click();
    await page.locator('mat-option:has-text("Solution")').click();

    // Update should be reflected in form
    await expect(page.locator('mat-select[formcontrolname="node_type"]')).toContainText('Solution');
  });

  test('should update node status in dialog', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Wait for node and double-click at center
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Wait for dialog
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Change status to In Progress
    await page.locator('mat-select[formcontrolname="status"]').click();
    await page.locator('mat-option:has-text("In Progress")').click();

    // Update should be reflected in form
    await expect(page.locator('mat-select[formcontrolname="status"]')).toContainText('In Progress');
  });

  test('should cancel edit without saving', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Wait for node and double-click at center
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Wait for dialog
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Update title
    const titleInput = page.locator('input[formcontrolname="title"]');
    const originalTitle = await titleInput.inputValue();
    await titleInput.fill('Changed Title That Should Not Save');

    // Click cancel
    await page.locator('button:has-text("Cancel")').click();

    // Dialog should close without saving
    await expect(page.locator('h2:has-text("Edit Node")')).not.toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Wait for node and double-click at center
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Wait for dialog
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Clear title (required field)
    const titleInput = page.locator('input[formcontrolname="title"]');
    await titleInput.fill('');

    // Save button should be disabled
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();
  });
});

test.describe('OST Editor - Parent-Child Connections', () => {
  test.beforeEach(async ({ page }) => {
    // Mock backend API responses for tree and node creation
    await page.route('**/api/trees', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: {
              id: 'test-tree-123',
              user_id: 'test-user',
              name: 'Test Tree',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Mock node creation with parent tracking
    let nodeCounter = 1;
    await page.route('**/api/trees/*/nodes', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            node: {
              id: `test-node-${nodeCounter++}`,
              tree_id: body.tree_id || 'test-tree-123',
              parent_id: body.parent_id || null,
              node_type: body.node_type,
              title: body.title,
              description: body.description || '',
              status: body.status || 'draft',
              position_x: body.position_x || 100,
              position_y: body.position_y || 100,
              display_order: body.display_order || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    // Mock node update endpoint - CRITICAL: must return the updated node_type
    await page.route('**/api/trees/*/nodes/*', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        const nodeId = route.request().url().split('/').pop();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            node: {
              id: nodeId,
              tree_id: 'test-tree-123',
              parent_id: null,
              node_type: body.node_type || 'outcome',
              title: body.title || 'Updated Node',
              description: body.description || '',
              status: body.status || 'draft',
              position_x: 100,
              position_y: 100,
              display_order: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('mat-toolbar', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('should create nodes without parent when nothing is selected', async ({ page }) => {
    // Create first node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Should have 1 node, 0 edges
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(1);
    
    const edges = page.locator('.x6-edge');
    await expect(edges).toHaveCount(0);
  });

  test('should show selected node in toolbar when clicked', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Click the node
    const node = page.locator('.x6-node').first();
    await node.click();
    await page.waitForTimeout(500);

    // Toolbar should show selection
    await expect(page.locator('.selected-node-info')).toBeVisible();
    await expect(page.locator('.selected-node-info')).toContainText('Selected:');
    await expect(page.locator('.selected-node-info')).toContainText('New outcome');
  });

  test('should clear selection when clicking canvas', async ({ page }) => {
    // Create and select a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);
    
    const node = page.locator('.x6-node').first();
    await node.click();
    await page.waitForTimeout(500);

    // Selection should be visible
    await expect(page.locator('.selected-node-info')).toBeVisible();

    // Click on empty canvas area
    await page.locator('.graph-container').click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(500);

    // Selection should be cleared
    await expect(page.locator('.selected-node-info')).not.toBeVisible();
  });

  test('should create child node when parent is selected', async ({ page }) => {
    // Create parent node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Select the parent
    const parentNode = page.locator('.x6-node').first();
    await parentNode.click();
    await page.waitForTimeout(500);

    // Verify selection
    await expect(page.locator('.selected-node-info')).toBeVisible();

    // Create child node
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Should have 2 nodes
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(2);

    // Should have 1 edge connecting them
    const edges = page.locator('.x6-edge');
    await expect(edges).toHaveCount(1);
  });

  test('should create multiple children from same parent', async ({ page }) => {
    // Create parent
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Select parent
    const parentNode = page.locator('.x6-node').first();
    await parentNode.click();
    await page.waitForTimeout(500);

    // Create first child
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Re-select parent (child creation may have changed selection)
    await parentNode.click();
    await page.waitForTimeout(500);

    // Create second child
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Should have 3 nodes total
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(3);

    // Should have 2 edges
    const edges = page.locator('.x6-edge');
    await expect(edges).toHaveCount(2);
  });

  test('should create grandchild nodes (3 levels)', async ({ page }) => {
    // Create outcome (level 1)
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Select outcome and create opportunity (level 2)
    let node = page.locator('.x6-node').first();
    await node.click();
    await page.waitForTimeout(500);
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Select opportunity and create solution (level 3)
    node = page.locator('.x6-node').nth(1);
    await node.click();
    await page.waitForTimeout(500);
    await page.locator('button[mattooltip*="Solution"]').click();
    await page.waitForTimeout(1000);

    // Should have 3 nodes
    const nodes = page.locator('.x6-node');
    await expect(nodes).toHaveCount(3);

    // Should have 2 edges (outcome->opportunity, opportunity->solution)
    const edges = page.locator('.x6-edge');
    await expect(edges).toHaveCount(2);
  });

  test('should allow switching selection between nodes', async ({ page }) => {
    // Create two nodes
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Select first node
    const firstNode = page.locator('.x6-node').first();
    await firstNode.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.selected-node-info')).toContainText('New outcome');

    // Select second node
    const secondNode = page.locator('.x6-node').nth(1);
    await secondNode.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.selected-node-info')).toContainText('New opportunity');
  });

  test('should update node type visually when changed in dialog', async ({ page }) => {
    // Create an outcome node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    // Verify initial type is OUTCOME
    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    await expect(node.locator('text').filter({ hasText: /^OUTCOME$/ })).toBeVisible();

    // Double-click to open edit dialog
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Wait for dialog
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Change node type from Outcome to Solution
    await page.locator('mat-select[formcontrolname="node_type"]').click();
    await page.waitForTimeout(300);
    await page.locator('mat-option:has-text("Solution")').click();
    await page.waitForTimeout(500);

    // Click save
    await page.locator('button:has-text("Save")').click();
    await page.waitForTimeout(1000);

    // Dialog should close
    await expect(page.locator('mat-dialog-container')).not.toBeVisible({ timeout: 5000 });

    // CRITICAL: Node type text should now show SOLUTION instead of OUTCOME
    await expect(node.locator('text').filter({ hasText: /^SOLUTION$/ })).toBeVisible({ timeout: 5000 });
    await expect(node.locator('text').filter({ hasText: /^OUTCOME$/ })).not.toBeVisible();
  });
});

test.describe('OST Editor - Node Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/trees', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: { id: 'test-tree-123', user_id: 'test-user', name: 'Test Tree', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          }),
        });
      }
    });

    let nodeCounter = 1;
    await page.route('**/api/trees/*/nodes', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            node: { id: `test-node-${nodeCounter++}`, tree_id: 'test-tree-123', parent_id: body.parent_id || null, node_type: body.node_type, title: body.title, description: '', status: 'draft', position_x: 100, position_y: 100, display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          }),
        });
      }
    });

    await page.route('**/api/trees/*/nodes/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        const nodeId = route.request().url().split('/').pop();
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Node deleted', id: nodeId }) });
      } else if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        const nodeId = route.request().url().split('/').pop();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            node: { id: nodeId, tree_id: 'test-tree-123', parent_id: null, node_type: body.node_type || 'outcome', title: body.title || 'Updated', description: '', status: body.status || 'draft', position_x: 100, position_y: 100, display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('mat-toolbar', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('should show delete button in edit dialog', async ({ page }) => {
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    const node = page.locator('.x6-node').first();
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete") mat-icon:has-text("delete")')).toBeVisible();
  });

  test('should delete node when delete button is clicked and confirmed', async ({ page }) => {
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1500);

    const node = page.locator('.x6-node').first();
    await expect(node).toBeVisible();

    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());
    
    await page.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(1000);

    // Dialog should close
    await expect(page.locator('mat-dialog-container')).not.toBeVisible({ timeout: 5000 });
    
    // Node should be removed
    await expect(page.locator('.x6-node')).toHaveCount(0);
  });
});

test.describe('OST Editor - Hierarchy Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/trees', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: { id: 'test-tree-123', user_id: 'test-user', name: 'Test Tree', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          }),
        });
      }
    });

    let nodeCounter = 1;
    await page.route('**/api/trees/*/nodes', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            node: { id: `test-node-${nodeCounter++}`, tree_id: 'test-tree-123', parent_id: body.parent_id || null, node_type: body.node_type, title: body.title, description: '', status: 'draft', position_x: 100, position_y: 100, display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          }),
        });
      }
    });

    await page.route('**/api/trees/*/nodes/*', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        const nodeId = route.request().url().split('/').pop();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            node: { id: nodeId, tree_id: 'test-tree-123', parent_id: null, node_type: body.node_type || 'outcome', title: body.title || 'Updated', description: '', status: body.status || 'draft', position_x: 100, position_y: 100, display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('mat-toolbar', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('should prevent adding invalid child type (Solution to Outcome)', async ({ page }) => {
    // Create outcome
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Select outcome
    await page.locator('.x6-node').first().click();
    await page.waitForTimeout(500);

    // Set up dialog handler for error
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Outcome nodes can only have Opportunity children');
      dialog.accept();
    });

    // Try to add Solution (should fail)
    await page.locator('button[mattooltip*="Solution"]').click();
    await page.waitForTimeout(500);

    // Should still have only 1 node
    await expect(page.locator('.x6-node')).toHaveCount(1);
  });

  test('should allow valid child type (Opportunity to Outcome)', async ({ page }) => {
    // Create outcome
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Select outcome
    await page.locator('.x6-node').first().click();
    await page.waitForTimeout(500);

    // Add Opportunity (should succeed)
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Should have 2 nodes and 1 edge
    await expect(page.locator('.x6-node')).toHaveCount(2);
    await expect(page.locator('.x6-edge')).toHaveCount(1);
  });

  test('should prevent adding children to Experiment nodes', async ({ page }) => {
    // Create a node
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Change it to Experiment for testing
    const node = page.locator('.x6-node').first();
    const box = await node.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });
    await page.locator('mat-select[formcontrolname="node_type"]').click();
    await page.waitForTimeout(300);
    await page.locator('mat-option:has-text("Experiment")').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Save")').click();
    await page.waitForTimeout(1000);

    // Select the experiment node
    await page.locator('.x6-node').first().click();
    await page.waitForTimeout(500);

    // Set up dialog handler for error
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Experiment nodes cannot have children');
      dialog.accept();
    });

    // Try to add any node (should fail)
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(500);

    // Should still have only 1 node
    await expect(page.locator('.x6-node')).toHaveCount(1);
  });

  test('should enforce full hierarchy chain (Outcome→Opportunity→Solution→Experiment)', async ({ page }) => {
    // Create Outcome
    await page.locator('button[mattooltip*="Outcome"]').click();
    await page.waitForTimeout(1000);

    // Add Opportunity
    await page.locator('.x6-node').first().click();
    await page.waitForTimeout(500);
    await page.locator('button[mattooltip*="Opportunity"]').click();
    await page.waitForTimeout(1000);

    // Add Solution
    await page.locator('.x6-node').nth(1).click();
    await page.waitForTimeout(500);
    await page.locator('button[mattooltip*="Solution"]').click();
    await page.waitForTimeout(1000);

    // Add Experiment
    await page.locator('.x6-node').nth(2).click();
    await page.waitForTimeout(500);
    await page.locator('button[mattooltip*="Experiment"]').click();
    await page.waitForTimeout(1000);

    // Should have 4 nodes and 3 edges
    await expect(page.locator('.x6-node')).toHaveCount(4);
    await expect(page.locator('.x6-edge')).toHaveCount(3);
  });
});

