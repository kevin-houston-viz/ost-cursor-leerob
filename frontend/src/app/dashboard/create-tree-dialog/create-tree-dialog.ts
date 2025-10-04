import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api';
import { OSTTree } from '../../models/tree.model';

export interface CreateTreeDialogData {}

@Component({
  selector: 'app-create-tree-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './create-tree-dialog.html',
  styleUrl: './create-tree-dialog.scss'
})
export class CreateTreeDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateTreeDialog>);
  private apiService = inject(ApiService);

  treeForm: FormGroup;
  creating = false;
  error: string | null = null;

  constructor() {
    this.treeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  onCreate(): void {
    if (this.treeForm.valid && !this.creating) {
      this.creating = true;
      this.error = null;

      this.apiService.createTree(this.treeForm.value).subscribe({
        next: (response) => {
          this.dialogRef.close(response.tree);
        },
        error: (error) => {
          console.error('Failed to create tree:', error);
          this.error = error.message || 'Failed to create OST';
          this.creating = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

