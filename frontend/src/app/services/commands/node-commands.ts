import { Command } from '../command-history.service';
import { ApiService } from '../api';
import { GraphService } from '../graph';
import { Node, CreateNodeInput, UpdateNodeInput } from '../../models/tree.model';

// Command for creating a node
export class CreateNodeCommand implements Command {
  description = 'Create node';
  private createdNode?: Node;

  constructor(
    private apiService: ApiService,
    private graphService: GraphService,
    private treeId: string,
    private nodeData: CreateNodeInput
  ) {
    this.description = `Create ${nodeData.node_type} node`;
  }

  async execute(): Promise<void> {
    const response = await this.apiService.createNode(this.treeId, this.nodeData).toPromise();
    if (response) {
      this.createdNode = response.node;
      this.graphService.addNode(this.createdNode);
      
      // Add edge if there's a parent
      if (this.createdNode.parent_id) {
        this.graphService.addEdge(this.createdNode.parent_id, this.createdNode.id);
      }
    }
  }

  async undo(): Promise<void> {
    if (this.createdNode) {
      await this.apiService.deleteNode(this.treeId, this.createdNode.id).toPromise();
      this.graphService.removeNode(this.createdNode.id);
    }
  }
}

// Command for deleting a node
export class DeleteNodeCommand implements Command {
  description: string;
  private deletedNode: Node;
  private childNodes: Node[] = [];

  constructor(
    private apiService: ApiService,
    private graphService: GraphService,
    private treeId: string,
    private node: Node,
    private allNodes: Node[]
  ) {
    this.deletedNode = { ...node };
    this.description = `Delete ${node.node_type} node`;
    
    // Find all child nodes (they will be deleted too)
    this.findChildren(node.id);
  }

  private findChildren(nodeId: string): void {
    const children = this.allNodes.filter(n => n.parent_id === nodeId);
    this.childNodes.push(...children);
    
    // Recursively find grandchildren
    children.forEach(child => this.findChildren(child.id));
  }

  async execute(): Promise<void> {
    await this.apiService.deleteNode(this.treeId, this.deletedNode.id).toPromise();
    this.graphService.removeNode(this.deletedNode.id);
  }

  async undo(): Promise<void> {
    // Recreate the deleted node
    const response = await this.apiService.createNode(this.treeId, {
      tree_id: this.deletedNode.tree_id,
      parent_id: this.deletedNode.parent_id,
      node_type: this.deletedNode.node_type,
      title: this.deletedNode.title,
      description: this.deletedNode.description,
      status: this.deletedNode.status,
      position_x: this.deletedNode.position_x,
      position_y: this.deletedNode.position_y,
      display_order: this.deletedNode.display_order,
    }).toPromise();

    if (response) {
      this.graphService.addNode(response.node);
      
      if (response.node.parent_id) {
        this.graphService.addEdge(response.node.parent_id, response.node.id);
      }

      // Recreate child nodes (if any)
      for (const child of this.childNodes) {
        const childResponse = await this.apiService.createNode(this.treeId, {
          tree_id: child.tree_id,
          parent_id: response.node.id, // Point to recreated parent
          node_type: child.node_type,
          title: child.title,
          description: child.description,
          status: child.status,
          position_x: child.position_x,
          position_y: child.position_y,
          display_order: child.display_order,
        }).toPromise();

        if (childResponse) {
          this.graphService.addNode(childResponse.node);
          this.graphService.addEdge(response.node.id, childResponse.node.id);
        }
      }
    }
  }
}

// Command for updating a node
export class UpdateNodeCommand implements Command {
  description: string;
  private oldNode: Node;
  private newData: UpdateNodeInput;

  constructor(
    private apiService: ApiService,
    private graphService: GraphService,
    private treeId: string,
    private node: Node,
    newData: UpdateNodeInput
  ) {
    this.oldNode = { ...node };
    this.newData = { ...newData };
    this.description = `Update ${node.node_type} node`;
  }

  async execute(): Promise<void> {
    const response = await this.apiService.updateNode(
      this.treeId,
      this.oldNode.id,
      this.newData
    ).toPromise();

    if (response) {
      this.graphService.updateNode(response.node);
    }
  }

  async undo(): Promise<void> {
    const response = await this.apiService.updateNode(
      this.treeId,
      this.oldNode.id,
      {
        title: this.oldNode.title,
        description: this.oldNode.description,
        node_type: this.oldNode.node_type,
        status: this.oldNode.status,
      }
    ).toPromise();

    if (response) {
      this.graphService.updateNode(response.node);
    }
  }
}

// Command for moving a node (position change)
export class MoveNodeCommand implements Command {
  description = 'Move node';
  private oldPosition: { x: number; y: number };
  private newPosition: { x: number; y: number };

  constructor(
    private apiService: ApiService,
    private graphService: GraphService,
    private treeId: string,
    private nodeId: string,
    oldX: number,
    oldY: number,
    newX: number,
    newY: number
  ) {
    this.oldPosition = { x: oldX, y: oldY };
    this.newPosition = { x: newX, y: newY };
  }

  async execute(): Promise<void> {
    await this.apiService.updateNode(this.treeId, this.nodeId, {
      position_x: this.newPosition.x,
      position_y: this.newPosition.y,
    }).toPromise();

    this.graphService.updateNodePosition(this.nodeId, this.newPosition.x, this.newPosition.y);
  }

  async undo(): Promise<void> {
    await this.apiService.updateNode(this.treeId, this.nodeId, {
      position_x: this.oldPosition.x,
      position_y: this.oldPosition.y,
    }).toPromise();

    this.graphService.updateNodePosition(this.nodeId, this.oldPosition.x, this.oldPosition.y);
  }
}


