import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, signal, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../services/api';
import { GraphService } from '../services/graph';
import { ThemeService } from '../services/theme.service';
import { CommandHistoryService } from '../services/command-history.service';
import { CreateNodeCommand, DeleteNodeCommand, UpdateNodeCommand } from '../services/commands/node-commands';
import { TreeWithNodes, Node, NodeType, UpdateNodeInput } from '../models/tree.model';
import { NodeEditDialog, NodeEditDialogData } from './node-edit-dialog/node-edit-dialog';

// Dialog result can be: updated Node, delete action, or null (cancelled)
interface DeleteAction {
  action: 'delete';
  node: Node;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './editor.html',
  styleUrl: './editor.scss'
})
export class Editor implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphContainer', { static: false }) graphContainer!: ElementRef<HTMLElement>;

  private apiService = inject(ApiService);
  private graphService = inject(GraphService);
  private themeService = inject(ThemeService);
  private commandHistory = inject(CommandHistoryService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private ngZone = inject(NgZone);

  treeId = signal<string | null>(null);
  tree = signal<TreeWithNodes | null>(null);
  loading = signal<boolean>(false);
  selectedNode = signal<Node | null>(null);
  canUndo = signal<boolean>(false);
  canRedo = signal<boolean>(false);

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Get tree ID from route if editing existing tree
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.treeId.set(params['id']);
        // Note: loadTree will be called after graph is initialized
      }
    });
  }

  ngAfterViewInit(): void {
    // CRITICAL: Initialize the graph FIRST before any operations
    if (this.graphContainer) {
      this.graphService.initGraph(this.graphContainer.nativeElement);
      
      // Subscribe to node click events for selection
      const clickSub = this.graphService.nodeClick$.subscribe(node => {
        this.ngZone.run(() => {
          this.selectedNode.set(node);
        });
      });
      this.subscriptions.push(clickSub);

      // Subscribe to blank canvas click to clear selection
      const blankClickSub = this.graphService.blankClick$.subscribe(() => {
        this.ngZone.run(() => {
          this.selectedNode.set(null);
        });
      });
      this.subscriptions.push(blankClickSub);

      // Subscribe to node double-click events
      // CRITICAL: Run inside NgZone because AntV X6 events fire outside Angular's zone
      const doubleClickSub = this.graphService.nodeDoubleClick$.subscribe(node => {
        this.ngZone.run(() => {
          this.openNodeEditDialog(node);
        });
      });
      this.subscriptions.push(doubleClickSub);

      // Subscribe to command history state changes
      const undoSub = this.commandHistory.canUndo$.subscribe(canUndo => {
        this.ngZone.run(() => {
          this.canUndo.set(canUndo);
        });
      });
      this.subscriptions.push(undoSub);

      const redoSub = this.commandHistory.canRedo$.subscribe(canRedo => {
        this.ngZone.run(() => {
          this.canRedo.set(canRedo);
        });
      });
      this.subscriptions.push(redoSub);
      
      // Now that graph is ready, load or create tree
      const id = this.treeId();
      if (id) {
        // Load existing tree from route
        this.loadTree(id);
      } else {
        // Create a new demo tree
        this.createDemoTree();
      }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.graphService.destroy();
  }

  loadTree(id: string): void {
    this.loading.set(true);
    this.apiService.getTreeWithNodes(id).subscribe({
      next: (response) => {
        this.tree.set(response.tree);
        this.renderTree(response.tree);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load tree:', error);
        this.loading.set(false);
      }
    });
  }

  createDemoTree(): void {
    this.loading.set(true);
    this.apiService.createTree({
      title: 'My First OST',
      description: 'A simple Opportunity Solution Tree example'
    }).subscribe({
      next: (response) => {
        console.log('Tree created:', response.tree);
        this.treeId.set(response.tree.id);
        // Create some demo nodes
        this.createDemoNodes(response.tree.id);
      },
      error: (error) => {
        console.error('Failed to create tree:', error);
        this.loading.set(false);
        // Still allow manual node creation
        alert('Failed to create demo tree. Backend may not be running. Check console for details.');
      }
    });
  }

  createDemoNodes(treeId: string): void {
    // Create outcome node
    this.apiService.createNode(treeId, {
      tree_id: treeId,
      node_type: 'outcome',
      title: 'Increase User Retention',
      description: 'Improve our 30-day retention rate from 40% to 60%',
      status: 'in_progress',
      position_x: 400,
      position_y: 100,
      display_order: 0
    }).subscribe({
      next: (outcomeResponse) => {
        const outcomeNode = outcomeResponse.node;
        
        // Create opportunity node
        this.apiService.createNode(treeId, {
          tree_id: treeId,
          parent_id: outcomeNode.id,
          node_type: 'opportunity',
          title: 'Users don\'t understand core value',
          description: 'New users struggle to see the value proposition',
          status: 'validated',
          position_x: 400,
          position_y: 250,
          display_order: 0
        }).subscribe({
          next: (opportunityResponse) => {
            // Load the full tree to display
            this.loadTree(treeId);
          }
        });
      }
    });
  }

  // Validate OST hierarchy rules: Outcome → Opportunity → Solution → Experiment
  private validateParentChildRelationship(parentType: NodeType, childType: NodeType): string | null {
    const validChildren: Record<NodeType, NodeType[]> = {
      outcome: ['opportunity'],
      opportunity: ['solution'],
      solution: ['experiment'],
      experiment: [], // Experiments cannot have children
    };

    const allowed = validChildren[parentType];
    if (!allowed.includes(childType)) {
      const childName = childType.charAt(0).toUpperCase() + childType.slice(1);
      const parentName = parentType.charAt(0).toUpperCase() + parentType.slice(1);
      
      if (allowed.length === 0) {
        return `${parentName} nodes cannot have children. ${childName} cannot be added here.`;
      }
      
      const expectedChild = allowed[0].charAt(0).toUpperCase() + allowed[0].slice(1);
      return `OST Hierarchy Error: ${parentName} nodes can only have ${expectedChild} children, not ${childName}.`;
    }
    
    return null;
  }

  renderTree(tree: TreeWithNodes): void {
    // Safety check (should not happen with fixed initialization order)
    if (!this.graphService.getGraph()) {
      console.error('UNEXPECTED: Graph not initialized when renderTree called');
      return;
    }

    this.graphService.clear();

    // Add all nodes
    tree.nodes.forEach(node => {
      this.graphService.addNode(node);
    });

    // Add edges between parent and child nodes
    tree.nodes.forEach(node => {
      if (node.parent_id) {
        this.graphService.addEdge(node.parent_id, node.id);
      }
    });

    // Center content after rendering
    setTimeout(() => {
      this.graphService.centerContent();
    }, 100);
  }

  private nextRootNodePosition = { x: 150, y: 150 };

  addNode(type: NodeType): void {
    const treeId = this.treeId();
    if (!treeId) {
      console.error('Cannot add node: No tree ID available');
      alert('Please wait for the tree to load before adding nodes');
      return;
    }

    // Check if graph is initialized
    if (!this.graphService.getGraph()) {
      console.error('Graph not initialized');
      return;
    }

    const selected = this.selectedNode();
    const parentId = selected?.id || undefined;

    // Validate OST hierarchy rules
    if (selected) {
      const validationError = this.validateParentChildRelationship(selected.node_type, type);
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    // Calculate position based on parent or deterministic spacing
    let posX: number;
    let posY: number;
    
    if (selected && selected.position_x !== undefined && selected.position_y !== undefined) {
      // Position new node below parent
      // Check how many siblings this node will have
      const tree = this.tree();
      const siblings = tree?.nodes.filter(n => n.parent_id === selected.id) || [];
      const siblingCount = siblings.length;
      
      // Space siblings horizontally, centered around parent
      const horizontalSpacing = 320; // Space between siblings
      const verticalOffset = 180; // Distance below parent
      
      // Center children below parent by calculating total width and offsetting
      // For n children, they should be evenly distributed:
      // - 1 child: directly below parent (offset 0)
      // - 2 children: offset -160, +160 from parent center
      // - 3 children: offset -320, 0, +320 from parent center
      const totalWidth = (siblingCount) * horizontalSpacing;
      const startOffset = -(totalWidth / 2) + (horizontalSpacing / 2);
      
      // Calculate position based on sibling index
      // Convert to numbers to ensure arithmetic operations (not string concatenation)
      posX = Number(selected.position_x) + startOffset + (siblingCount * horizontalSpacing);
      posY = Number(selected.position_y) + verticalOffset;
    } else {
      // Position root nodes in a non-overlapping pattern
      posX = this.nextRootNodePosition.x;
      posY = this.nextRootNodePosition.y;
      
      // Update next position to avoid overlap (horizontal spacing)
      this.nextRootNodePosition.x += 250;
      
      // Wrap to next row if needed
      if (this.nextRootNodePosition.x > 800) {
        this.nextRootNodePosition.x = 150;
        this.nextRootNodePosition.y += 200;
      }
    }

    // Create command for creating the node
    const command = new CreateNodeCommand(
      this.apiService,
      this.graphService,
      treeId,
      {
        tree_id: treeId,
        parent_id: parentId,
        node_type: type,
        title: `New ${type}`,
        status: 'draft',
        position_x: posX,
        position_y: posY,
        display_order: 0
      }
    );

    // Execute command (supports undo/redo)
    this.commandHistory.executeCommand(command).then(() => {
      // Auto-layout to ensure professional tree arrangement
      setTimeout(() => {
        if (parentId) {
          // Only auto-layout when adding child nodes (not root nodes)
          this.graphService.autoLayout();
        }
        this.graphService.centerContent();
      }, 50);
    }).catch((error) => {
      console.error('Failed to create node:', error);
      alert(`Failed to create node: ${error.message || 'Unknown error'}`);
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.graphService.updateTheme();
  }

  // Undo/Redo controls
  undo(): void {
    this.commandHistory.undo();
  }

  redo(): void {
    this.commandHistory.redo();
  }

  // Zoom controls
  zoomIn(): void {
    this.graphService.zoomIn();
  }

  zoomOut(): void {
    this.graphService.zoomOut();
  }

  zoomToFit(): void {
    this.graphService.zoomToFit();
  }

  centerContent(): void {
    this.graphService.centerContent();
  }

  autoLayout(): void {
    this.graphService.autoLayout();
  }

  // Export functionality
  async exportToPNG(): Promise<void> {
    const tree = this.tree();
    const filename = tree?.title ? tree.title.replace(/\s+/g, '-').toLowerCase() : 'ost-diagram';
    
    try {
      await this.graphService.exportToPNG(filename);
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG. Please try again.');
    }
  }

  async exportToPDF(): Promise<void> {
    const tree = this.tree();
    const filename = tree?.title ? tree.title.replace(/\s+/g, '-').toLowerCase() : 'ost-diagram';
    
    try {
      await this.graphService.exportToPDF(filename);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  }

  // Open dialog to edit node
  openNodeEditDialog(node: Node): void {
    const dialogRef = this.dialog.open<NodeEditDialog, NodeEditDialogData, Node | DeleteAction | null>(
      NodeEditDialog,
      {
        width: '600px',
        data: { node }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Check if it's a delete action using type guard
        if (this.isDeleteAction(result)) {
          this.deleteNode(result.node);
        } else {
          // It's an updated node
          this.updateNode(result);
        }
      }
    });
  }

  private isDeleteAction(result: Node | DeleteAction): result is DeleteAction {
    return 'action' in result && result.action === 'delete';
  }

  // Update node via API and refresh graph
  updateNode(node: Node): void {
    const treeId = this.treeId();
    if (!treeId) {
      console.error('Cannot update node: No tree ID available');
      return;
    }

    // Validate hierarchy if node type changed and has parent
    if (node.parent_id) {
      const parentNode = this.findNodeById(node.parent_id);
      if (parentNode) {
        const validationError = this.validateParentChildRelationship(parentNode.node_type, node.node_type);
        if (validationError) {
          alert(validationError + '\n\nTo change this node type, you must first move it to an appropriate parent or remove its parent connection.');
          return;
        }
      }
    }

    // Validate children if node type changed and has children
    const children = this.findChildrenOf(node.id);
    if (children.length > 0) {
      for (const child of children) {
        const validationError = this.validateParentChildRelationship(node.node_type, child.node_type);
        if (validationError) {
          alert(`Cannot change type: This node has ${child.node_type} children, which are not valid for the new type.\n\nPlease remove or reparent the children first.`);
          return;
        }
      }
    }

    // Create command for updating the node
    const command = new UpdateNodeCommand(
      this.apiService,
      this.graphService,
      treeId,
      node,
      {
        title: node.title,
        description: node.description,
        node_type: node.node_type,
        status: node.status,
      }
    );

    // Execute command (supports undo/redo)
    this.commandHistory.executeCommand(command).catch((error) => {
      console.error('Failed to update node:', error);
      alert(`Failed to update node: ${error.message || 'Unknown error'}`);
    });
  }

  private findNodeById(nodeId: string): Node | null {
    const tree = this.tree();
    if (!tree) return null;
    return tree.nodes.find(n => n.id === nodeId) || null;
  }

  private findChildrenOf(nodeId: string): Node[] {
    const tree = this.tree();
    if (!tree) return [];
    return tree.nodes.filter(n => n.parent_id === nodeId);
  }

  // Delete node via API and remove from graph
  deleteNode(node: Node): void {
    const treeId = this.treeId();
    const tree = this.tree();
    if (!treeId || !tree) {
      console.error('Cannot delete node: No tree ID available');
      return;
    }

    // Create command for deleting the node
    const command = new DeleteNodeCommand(
      this.apiService,
      this.graphService,
      treeId,
      node,
      tree.nodes
    );

    // Execute command (supports undo/redo)
    this.commandHistory.executeCommand(command).then(() => {
      // Clear selection if this node was selected
      if (this.selectedNode()?.id === node.id) {
        this.selectedNode.set(null);
      }
    }).catch((error) => {
      console.error('Failed to delete node:', error);
      alert(`Failed to delete node: ${error.message || 'Unknown error'}`);
    });
  }
}
