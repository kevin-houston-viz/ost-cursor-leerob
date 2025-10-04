import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Editor } from './editor/editor';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'editor/:id', component: Editor },
];
