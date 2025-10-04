import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Graph } from '@antv/x6';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { ThemeService } from './theme.service';
import { Node, NodeType, NodeStatus } from '../models/tree.model';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private themeService = inject(ThemeService);
  private graph: Graph | null = null;

  // Event emitters
  private nodeDoubleClickSource = new Subject<Node>();
  nodeDoubleClick$ = this.nodeDoubleClickSource.asObservable();
  
  private nodeClickSource = new Subject<Node>();
  nodeClick$ = this.nodeClickSource.asObservable();
  
  private blankClickSource = new Subject<void>();
  blankClick$ = this.blankClickSource.asObservable();
  
  private nodeMovedSource = new Subject<{ nodeId: string; position: { x: number; y: number } }>();
  nodeMoved$ = this.nodeMovedSource.asObservable();
  
  private selectedNodeId: string | null = null;

  initGraph(container: HTMLElement): Graph {
    const theme = this.themeService.theme();
    const themeColors = this.getThemeColors(theme);

    this.graph = new Graph({
      container,
      width: container.clientWidth,
      height: container.clientHeight,
      background: {
        color: themeColors.canvas,
      },
      grid: {
        visible: false,
      },
      panning: {
        enabled: true,
        // No modifiers - pan by dragging blank canvas
        // Node dragging still works when clicking on nodes
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        minScale: 0.5,
        maxScale: 2,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        allowMulti: false,
        highlight: true,
        connector: 'smooth',
        router: {
          name: 'manhattan',
          args: {
            padding: 20,
          },
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
      // Enable node movement/dragging
      interacting: {
        nodeMovable: true,
      },
      // Auto-resize container
      autoResize: true,
    });

    // Set up event listeners
    this.setupEventListeners();

    return this.graph;
  }

  private setupEventListeners(): void {
    if (!this.graph) return;

    // Node selection
    this.graph.on('node:click', ({ node }) => {
      const nodeData = node.getData() as Node;
      this.selectNode(nodeData.id);
      this.nodeClickSource.next(nodeData);
    });

    // Node moved - update position
    this.graph.on('node:moved', ({ node }) => {
      const nodeData = node.getData() as Node;
      const position = node.getPosition();
      this.nodeMovedSource.next({
        nodeId: nodeData.id,
        position: { x: position.x, y: position.y }
      });
    });

    // Node double-click for editing
    this.graph.on('node:dblclick', ({ node }) => {
      const nodeData = node.getData() as Node;
      this.nodeDoubleClickSource.next(nodeData);
    });

    // Blank canvas click - deselect
    this.graph.on('blank:click', () => {
      this.selectNode(null);
      this.blankClickSource.next();
    });
  }

  getGraph(): Graph | null {
    return this.graph;
  }

  addNode(node: Node): void {
    if (!this.graph) {
      console.error('Cannot add node: graph is null');
      return;
    }

    const theme = this.themeService.theme();
    const nodeColors = this.getNodeColors(node.node_type, theme);
    const statusIcon = this.getStatusIcon(node.status);

    // Create markup for node content
    const markup = [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
      {
        tagName: 'text',
        selector: 'type',
      },
      {
        tagName: 'text',
        selector: 'status',
      },
    ];

    this.graph.addNode({
      id: node.id,
      x: node.position_x !== undefined && node.position_x !== null ? Number(node.position_x) : 100,
      y: node.position_y !== undefined && node.position_y !== null ? Number(node.position_y) : 100,
      width: 320,
      height: 140,
      shape: 'rect',
      markup,
      attrs: {
        body: {
          fill: nodeColors.background,
          stroke: nodeColors.border,
          strokeWidth: 3,
          rx: 12,
          ry: 12,
          cursor: 'move',
        },
        label: {
          text: this.wrapText(node.title, 32), // ~32 chars per line for 290px width
          fill: nodeColors.text,
          fontSize: 14,
          fontWeight: 600,
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
          refX: '50%',
          refY: 15,
        },
        type: {
          text: node.node_type.toUpperCase(),
          fill: nodeColors.border,
          fontSize: 10,
          fontWeight: 500,
          textAnchor: 'start',
          textVerticalAnchor: 'bottom',
          refX: 15,
          refY: -10,
        },
        status: {
          text: `${statusIcon} ${node.status.replace('_', ' ')}`,
          fill: nodeColors.text,
          fontSize: 10,
          textAnchor: 'end',
          textVerticalAnchor: 'bottom',
          refX: '95%',
          refY: -10,
          opacity: 0.8,
        },
      },
      data: node,
    });
  }


  private wrapText(text: string, maxCharsPerLine: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }

  private getStatusIcon(status: NodeStatus): string {
    const icons = {
      draft: '📝',
      in_progress: '⚡',
      validated: '✅',
      deprioritized: '⏸️',
      completed: '🎉',
    };
    return icons[status] || '•';
  }

  addEdge(sourceId: string, targetId: string): void {
    if (!this.graph) return;

    const theme = this.themeService.theme();
    const themeColors = this.getThemeColors(theme);

    this.graph.addEdge({
      source: sourceId,
      target: targetId,
      attrs: {
        line: {
          stroke: themeColors.edge,
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            size: 8,
          },
        },
      },
      connector: { name: 'rounded', args: { radius: 8 } }, // Rounded corners for smoother appearance
      router: {
        name: 'orth',
        args: {
          padding: 1,
        },
      },
    });
  }

  private getThemeColors(theme: 'light' | 'dark') {
    const colors = {
      light: {
        canvas: '#f9fafb',
        grid: '#e5e7eb',
        edge: '#9ca3af',
      },
      dark: {
        canvas: '#1e293b',
        grid: '#374151',
        edge: '#6b7280',
      }
    };
    return colors[theme];
  }

  private getNodeColors(nodeType: NodeType, theme: 'light' | 'dark') {
    const nodeColors = {
      outcome: {
        light: { background: '#E3F2FD', border: '#1976D2', text: '#0D47A1' },
        dark: { background: '#1A237E', border: '#42A5F5', text: '#E3F2FD' },
      },
      opportunity: {
        light: { background: '#F3E5F5', border: '#7B1FA2', text: '#4A148C' },
        dark: { background: '#4A148C', border: '#BA68C8', text: '#F3E5F5' },
      },
      solution: {
        light: { background: '#E8F5E9', border: '#388E3C', text: '#1B5E20' },
        dark: { background: '#1B5E20', border: '#66BB6A', text: '#E8F5E9' },
      },
      experiment: {
        light: { background: '#FFF3E0', border: '#F57C00', text: '#E65100' },
        dark: { background: '#E65100', border: '#FFB74D', text: '#FFF3E0' },
      },
    };
    return nodeColors[nodeType][theme];
  }

  updateTheme(): void {
    if (!this.graph) return;

    const theme = this.themeService.theme();
    const themeColors = this.getThemeColors(theme);

    // Update background
    this.graph.drawBackground({
      color: themeColors.canvas,
    });

    // Update all nodes
    this.graph.getNodes().forEach(node => {
      const nodeData = node.getData() as Node;
      if (nodeData) {
        const nodeColors = this.getNodeColors(nodeData.node_type, theme);
        node.attr({
          body: {
            fill: nodeColors.background,
            stroke: nodeColors.border,
          },
          label: {
            fill: nodeColors.text,
          },
          type: {
            fill: nodeColors.border,
          },
          status: {
            fill: nodeColors.text,
          },
        });
      }
    });

    // Update all edges
    this.graph.getEdges().forEach(edge => {
      edge.attr({
        line: {
          stroke: themeColors.edge,
        },
      });
    });
  }

  clear(): void {
    if (this.graph) {
      this.graph.clearCells();
    }
  }

  removeNode(nodeId: string): void {
    if (!this.graph) return;
    
    const node = this.getNodeById(nodeId);
    if (node) {
      // Remove the node and all connected edges
      node.remove();
    }
  }

  destroy(): void {
    if (this.graph) {
      this.graph.dispose();
      this.graph = null;
    }
  }

  // Zoom controls
  zoomIn(): void {
    if (this.graph) {
      this.graph.zoom(0.1);
    }
  }

  zoomOut(): void {
    if (this.graph) {
      this.graph.zoom(-0.1);
    }
  }

  zoomToFit(): void {
    if (this.graph) {
      this.graph.zoomToFit({ padding: 20, maxScale: 1 });
    }
  }

  resetZoom(): void {
    if (this.graph) {
      this.graph.scale(1, 1);
      this.graph.centerContent();
    }
  }

  // Get node by ID
  getNodeById(id: string) {
    return this.graph?.getCellById(id);
  }

  // Update node position
  updateNodePosition(id: string, x: number, y: number): void {
    const node = this.getNodeById(id);
    if (node && node.isNode()) {
      node.position(x, y);
    }
  }

  // Update node properties and visuals
  updateNode(updatedNode: Node): void {
    if (!this.graph) return;

    const graphNode = this.getNodeById(updatedNode.id);
    if (!graphNode || !graphNode.isNode()) {
      console.error('Node not found in graph:', updatedNode.id);
      return;
    }

    const theme = this.themeService.theme();
    const nodeColors = this.getNodeColors(updatedNode.node_type, theme);
    const statusIcon = this.getStatusIcon(updatedNode.status);

    // Update node data
    graphNode.setData(updatedNode);

    // Update node visuals
    graphNode.attr({
      body: {
        fill: nodeColors.background,
        stroke: nodeColors.border,
        strokeWidth: 3,
      },
      label: {
        text: this.wrapText(updatedNode.title, 32),
        fill: nodeColors.text,
      },
      type: {
        text: updatedNode.node_type.toUpperCase(),
        fill: nodeColors.border,
      },
      status: {
        text: `${statusIcon} ${updatedNode.status.replace('_', ' ')}`,
        fill: nodeColors.text,
      },
    });
  }

  // Center content
  centerContent(): void {
    if (this.graph) {
      this.graph.centerContent();
    }
  }

  // Node selection
  selectNode(nodeId: string | null): void {
    if (!this.graph) return;

    // Clear previous selection
    if (this.selectedNodeId) {
      const prevNode = this.graph.getCellById(this.selectedNodeId);
      if (prevNode && prevNode.isNode()) {
        // Remove selection styling
        prevNode.attr('body/strokeWidth', 3);
        prevNode.attr('body/shadowBlur', 0);
      }
    }

    this.selectedNodeId = nodeId;

    // Apply selection styling to new node
    if (nodeId) {
      const node = this.graph.getCellById(nodeId);
      if (node && node.isNode()) {
        // Add selection styling
        node.attr('body/strokeWidth', 5);
        node.attr('body/shadowBlur', 10);
        node.attr('body/shadowColor', '#4F46E5');
      }
    }
  }

  getSelectedNodeId(): string | null {
    return this.selectedNodeId;
  }

  // Auto-layout: Arrange nodes in a tree structure
  autoLayout(): void {
    if (!this.graph) return;

    const nodes = this.graph.getNodes();
    if (nodes.length === 0) return;

    // Build tree structure
    const nodeMap = new Map<string, any>();
    const rootNodes: any[] = [];

    nodes.forEach(node => {
      const data = node.getData() as Node;
      nodeMap.set(data.id, { node, data, children: [] });
    });

    // Find roots and build parent-child relationships
    nodeMap.forEach((item) => {
      if (item.data.parent_id && nodeMap.has(item.data.parent_id)) {
        const parent = nodeMap.get(item.data.parent_id);
        parent.children.push(item);
      } else {
        rootNodes.push(item);
      }
    });

    // Layout parameters
    const HORIZONTAL_SPACING = 350;
    const VERTICAL_SPACING = 180;
    const START_X = 100;
    const START_Y = 100;

    // Recursive layout function
    const layoutNode = (item: any, x: number, y: number, index: number, totalSiblings: number): number => {
      // Position current node
      item.node.position(x, y);

      if (item.children.length === 0) {
        return 1; // Leaf node takes 1 unit of width
      }

      // Layout children
      let childX = x;
      const childY = y + VERTICAL_SPACING;
      let totalWidth = 0;

      item.children.forEach((child: any, i: number) => {
        const width = layoutNode(child, childX, childY, i, item.children.length);
        childX += width * HORIZONTAL_SPACING;
        totalWidth += width;
      });

      // Center parent over children
      if (item.children.length > 0) {
        const firstChild = item.children[0];
        const lastChild = item.children[item.children.length - 1];
        const firstChildX = firstChild.node.getPosition().x;
        const lastChildX = lastChild.node.getPosition().x;
        const centerX = (firstChildX + lastChildX) / 2;
        item.node.position(centerX, y);
      }

      return Math.max(totalWidth, 1);
    };

    // Layout each root tree
    let currentX = START_X;
    rootNodes.forEach((root, index) => {
      const width = layoutNode(root, currentX, START_Y, index, rootNodes.length);
      currentX += width * HORIZONTAL_SPACING + 100; // Extra spacing between trees
    });

    // Emit position updates for all nodes so they get saved to the database
    nodes.forEach(node => {
      const data = node.getData() as Node;
      const position = node.getPosition();
      this.nodeMovedSource.next({
        nodeId: data.id,
        position: { x: position.x, y: position.y }
      });
    });

    // Center the result
    setTimeout(() => {
      this.centerContent();
    }, 100);
  }

  // Export to PNG
  async exportToPNG(filename: string = 'ost-diagram'): Promise<void> {
    if (!this.graph) {
      console.error('Cannot export: graph not initialized');
      return;
    }

    try {
      const theme = this.themeService.theme();
      const themeColors = this.getThemeColors(theme);

      // Get the graph container (the div containing the SVG)
      const container = this.graph.container;
      
      // Use html-to-image to convert the graph container to PNG
      const dataUrl = await htmlToImage.toPng(container, {
        backgroundColor: themeColors.canvas,
        quality: 1,
        pixelRatio: 2, // Higher resolution (2x)
        skipFonts: true, // Skip font inlining to avoid CORS errors with Google Fonts
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PNG export failed:', error);
      throw error;
    }
  }

  // Export to PDF
  async exportToPDF(filename: string = 'ost-diagram'): Promise<void> {
    if (!this.graph) {
      console.error('Cannot export: graph not initialized');
      return;
    }

    try {
      const theme = this.themeService.theme();
      const themeColors = this.getThemeColors(theme);

      // Get the graph container
      const container = this.graph.container;
      
      // Use html-to-image to convert the graph container to PNG
      const dataUrl = await htmlToImage.toPng(container, {
        backgroundColor: themeColors.canvas,
        quality: 1,
        pixelRatio: 2, // Higher resolution
        skipFonts: true, // Skip font inlining to avoid CORS errors with Google Fonts
      });

      // Create an image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate PDF dimensions
      const width = img.width;
      const height = img.height;
      const ratio = width / height;

      // Use landscape A4: 297mm x 210mm
      let pdfWidth = 297;
      let pdfHeight = 210;

      // Scale to fit
      const pdfRatio = pdfWidth / pdfHeight;
      if (ratio > pdfRatio) {
        pdfHeight = pdfWidth / ratio;
      } else {
        pdfWidth = pdfHeight * ratio;
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: ratio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add image centered
      const x = (297 - pdfWidth) / 2;
      const y = (210 - pdfHeight) / 2;
      pdf.addImage(dataUrl, 'PNG', x, y, pdfWidth, pdfHeight);

      // Save PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }
}
