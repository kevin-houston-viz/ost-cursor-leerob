import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  OSTTree,
  TreeWithNodes,
  Node,
  CreateTreeInput,
  UpdateTreeInput,
  CreateNodeInput,
  UpdateNodeInput
} from '../models/tree.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Tree endpoints
  getTrees(): Observable<{ trees: OSTTree[] }> {
    return this.http.get<{ trees: OSTTree[] }>(`${this.apiUrl}/trees`);
  }

  getTree(id: string): Observable<{ tree: OSTTree }> {
    return this.http.get<{ tree: OSTTree }>(`${this.apiUrl}/trees/${id}`);
  }

  getTreeWithNodes(id: string): Observable<{ tree: TreeWithNodes }> {
    return this.http.get<{ tree: TreeWithNodes }>(`${this.apiUrl}/trees/${id}/full`);
  }

  createTree(data: CreateTreeInput): Observable<{ tree: OSTTree }> {
    return this.http.post<{ tree: OSTTree }>(`${this.apiUrl}/trees`, data);
  }

  updateTree(id: string, data: UpdateTreeInput): Observable<{ tree: OSTTree }> {
    return this.http.patch<{ tree: OSTTree }>(`${this.apiUrl}/trees/${id}`, data);
  }

  deleteTree(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/trees/${id}`);
  }

  // Node endpoints
  getNodes(treeId: string): Observable<{ nodes: Node[] }> {
    return this.http.get<{ nodes: Node[] }>(`${this.apiUrl}/trees/${treeId}/nodes`);
  }

  getNode(treeId: string, nodeId: string): Observable<{ node: Node }> {
    return this.http.get<{ node: Node }>(`${this.apiUrl}/trees/${treeId}/nodes/${nodeId}`);
  }

  createNode(treeId: string, data: CreateNodeInput): Observable<{ node: Node }> {
    return this.http.post<{ node: Node }>(`${this.apiUrl}/trees/${treeId}/nodes`, data);
  }

  updateNode(treeId: string, nodeId: string, data: UpdateNodeInput): Observable<{ node: Node }> {
    return this.http.patch<{ node: Node }>(`${this.apiUrl}/trees/${treeId}/nodes/${nodeId}`, data);
  }

  deleteNode(treeId: string, nodeId: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/trees/${treeId}/nodes/${nodeId}`);
  }
}
