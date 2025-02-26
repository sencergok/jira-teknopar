import { Task } from './task';
import { ProjectMember, Project } from './project';

export interface SupabaseRealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  commit_timestamp: string;
  errors: null | any[];
  old: T;
  new: T;
}

export interface RealtimeTaskPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Task;
  old: Task;
}

export interface RealtimeMemberPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: ProjectMember;
  old: ProjectMember;
}

export interface RealtimeProjectPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Project;
  old: Project;
} 