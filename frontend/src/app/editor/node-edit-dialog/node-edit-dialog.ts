import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Node, NodeType, NodeStatus } from '../../models/tree.model';

export interface NodeEditDialogData {
  node: Node;
}

@Component({
  selector: 'app-node-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './node-edit-dialog.html',
  styleUrl: './node-edit-dialog.scss'
})
export class NodeEditDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NodeEditDialog>);
  data: NodeEditDialogData = inject(MAT_DIALOG_DATA);

  nodeForm: FormGroup;

  nodeStatuses: NodeStatus[] = ['draft', 'in_progress', 'validated', 'deprioritized', 'completed'];

  constructor() {
    this.nodeForm = this.fb.group({
      title: [this.data.node.title, [Validators.required, Validators.maxLength(255)]],
      description: [this.data.node.description || '', [Validators.maxLength(1000)]],
      status: [this.data.node.status, Validators.required],
    });
  }

  onSave(): void {
    if (this.nodeForm.valid) {
      const updatedNode = {
        ...this.data.node,
        ...this.nodeForm.value,
        // Preserve node_type - it should never be changed after creation
        node_type: this.data.node.node_type
      };
      this.dialogRef.close(updatedNode);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this node? This action cannot be undone.')) {
      this.dialogRef.close({ action: 'delete', node: this.data.node });
    }
  }

  getNodeTypeLabel(type: NodeType): string {
    const labels: Record<NodeType, string> = {
      outcome: '🎯 Outcome',
      opportunity: '💡 Opportunity',
      solution: '🔧 Solution',
      experiment: '🧪 Experiment'
    };
    return labels[type];
  }

  getStatusLabel(status: NodeStatus): string {
    const labels: Record<NodeStatus, string> = {
      draft: '📝 Draft',
      in_progress: '⚙️ In Progress',
      validated: '✅ Validated',
      deprioritized: '⏸️ Deprioritized',
      completed: '✔️ Completed'
    };
    return labels[status];
  }
}
