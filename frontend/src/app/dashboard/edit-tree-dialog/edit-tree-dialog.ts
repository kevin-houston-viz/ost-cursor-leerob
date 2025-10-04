import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api';
import { OSTTree } from '../../models/tree.model';

export interface EditTreeDialogData {
  tree: OSTTree;
}

@Component({
  selector: 'app-edit-tree-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-tree-dialog.html',
  styleUrl: './edit-tree-dialog.scss'
})
export class EditTreeDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditTreeDialog>);
  private apiService = inject(ApiService);
  data: EditTreeDialogData = inject(MAT_DIALOG_DATA);

  treeForm: FormGroup;
  updating = false;
  error: string | null = null;

  constructor() {
    this.treeForm = this.fb.group({
      title: [this.data.tree.title, [Validators.required, Validators.maxLength(255)]],
      description: [this.data.tree.description || '', [Validators.maxLength(1000)]],
    });
  }

  onUpdate(): void {
    if (this.treeForm.valid && !this.updating) {
      this.updating = true;
      this.error = null;

      this.apiService.updateTree(this.data.tree.id, this.treeForm.value).subscribe({
        next: (response) => {
          this.dialogRef.close(response.tree);
        },
        error: (error) => {
          console.error('Failed to update tree:', error);
          this.error = error.message || 'Failed to update OST';
          this.updating = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

