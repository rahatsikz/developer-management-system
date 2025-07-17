export interface Company {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  teams: Team[];
  projects: Project[];
  users: User[];
}

export interface Team {
  id: string;
  name: string;
  company: Company;
  companyId: string;
  members: User[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  team: Team;
  teamId: string;
  company: Company;
  companyId: string;
  repo: Repository;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
  company: Company;
  companyId: string;
  teams: Team[];
  prs: PullRequest[];
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

export type Repository = {
  id: string;
  githubId: number;
  name: string;
  url: string;
  projectId: string;
  project: Project;
  branches: Branch[];
  pullRequests: PullRequest[];
  createdAt: Date;
  updatedAt: Date;
};

export type Branch = {
  id: string;
  name: string;
  repoId: string;
  repo: Repository;
  pullRequests: PullRequest[];
  createdAt: Date;
};

export type PullRequest = {
  id: string;
  githubId: number;
  title: string;
  url: string;
  state: PRState;
  authorId: string;
  author: User;
  repoId: string;
  repo: Repository;
  branchId?: string;
  branch?: Branch;
  taskId?: string;
  task?: Task;
  mergedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export enum PRState {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  MERGED = "MERGED",
}

export type Task = {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  project: Project;
  assigneeId?: string;
  assignee?: User;
  status: TaskStatus;
  pr?: PullRequest;
  createdAt: Date;
  updatedAt: Date;
};

export enum TaskStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}
