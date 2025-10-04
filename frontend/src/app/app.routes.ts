import { Routes } from '@angular/router';
import { Editor } from './editor/editor';

export const routes: Routes = [
  { path: '', redirectTo: '/editor', pathMatch: 'full' },
  { path: 'editor', component: Editor },
  { path: 'editor/:id', component: Editor },
];
