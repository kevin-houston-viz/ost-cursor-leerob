import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../services/api';
import { ThemeService } from '../services/theme.service';
import { OSTTree } from '../models/tree.model';
import { CreateTreeDialog, CreateTreeDialogData } from './create-tree-dialog/create-tree-dialog';
import { EditTreeDialog, EditTreeDialogData } from './edit-tree-dialog/edit-tree-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private apiService = inject(ApiService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  trees = signal<OSTTree[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTrees();
  }

  loadTrees(): void {
    this.loading.set(true);
    this.apiService.getTrees().subscribe({
      next: (response) => {
        this.trees.set(response.trees || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load trees:', error);
        this.loading.set(false);
      }
    });
  }

  openTree(treeId: string): void {
    this.router.navigate(['/editor', treeId]);
  }

  createNewTree(): void {
    const dialogRef = this.dialog.open<CreateTreeDialog, CreateTreeDialogData, OSTTree | null>(
      CreateTreeDialog,
      {
        width: '500px'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Navigate to the new tree
        this.router.navigate(['/editor', result.id]);
      }
    });
  }

  editTree(tree: OSTTree, event: Event): void {
    event.stopPropagation(); // Prevent card click

    const dialogRef = this.dialog.open<EditTreeDialog, EditTreeDialogData, OSTTree | null>(
      EditTreeDialog,
      {
        width: '500px',
        data: { tree }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the tree in the list
        this.trees.set(this.trees().map(t => t.id === result.id ? result : t));
      }
    });
  }

  deleteTree(tree: OSTTree, event: Event): void {
    event.stopPropagation(); // Prevent card click

    if (confirm(`Are you sure you want to delete "${tree.title}"? This action cannot be undone.`)) {
      this.apiService.deleteTree(tree.id).subscribe({
        next: () => {
          // Remove from list
          this.trees.set(this.trees().filter(t => t.id !== tree.id));
        },
        error: (error) => {
          console.error('Failed to delete tree:', error);
          alert(`Failed to delete tree: ${error.message || 'Unknown error'}`);
        }
      });
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  formatDate(dateValue: string | Date): string {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

