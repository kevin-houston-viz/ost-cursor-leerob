import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Command interface for undo/redo operations
export interface Command {
  execute(): Promise<void> | void;
  undo(): Promise<void> | void;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandHistoryService {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize = 50; // Limit history to prevent memory issues

  // Observables for UI updates
  private canUndoSource = new Subject<boolean>();
  private canRedoSource = new Subject<boolean>();
  
  canUndo$ = this.canUndoSource.asObservable();
  canRedo$ = this.canRedoSource.asObservable();

  constructor() {
    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (event: KeyboardEvent) => {
        // Ctrl+Z or Cmd+Z for undo
        if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          this.undo();
        }
        // Ctrl+Shift+Z or Cmd+Shift+Z for redo
        else if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
          event.preventDefault();
          this.redo();
        }
        // Ctrl+Y or Cmd+Y for redo (alternative)
        else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
          event.preventDefault();
          this.redo();
        }
      });
    }
  }

  async executeCommand(command: Command): Promise<void> {
    await command.execute();
    
    // Add to undo stack
    this.undoStack.push(command);
    
    // Limit stack size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    // Clear redo stack when new command is executed
    this.redoStack = [];
    
    this.updateState();
  }

  async undo(): Promise<void> {
    if (this.undoStack.length === 0) {
      return;
    }

    const command = this.undoStack.pop();
    if (command) {
      await command.undo();
      this.redoStack.push(command);
      this.updateState();
    }
  }

  async redo(): Promise<void> {
    if (this.redoStack.length === 0) {
      return;
    }

    const command = this.redoStack.pop();
    if (command) {
      await command.execute();
      this.undoStack.push(command);
      this.updateState();
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.updateState();
  }

  getUndoDescription(): string | null {
    if (this.undoStack.length === 0) return null;
    return this.undoStack[this.undoStack.length - 1].description;
  }

  getRedoDescription(): string | null {
    if (this.redoStack.length === 0) return null;
    return this.redoStack[this.redoStack.length - 1].description;
  }

  private updateState(): void {
    this.canUndoSource.next(this.canUndo());
    this.canRedoSource.next(this.canRedo());
  }
}


