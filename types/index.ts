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
  company: Company;
  companyId: string;
  users: User[];
  Spaces: Space[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Space {
  id: string;
  name: string;
  repo?: Repository;
  tasks: Task[];
  members: User[];
  createdAt: Date;
  updatedAt: Date;
  project: Project;
  projectId: string;
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

export type Chat = {
  id: string;
  users: User[];
  createdAt: Date;
  updatedAt: Date;
  spaceId: string;
  space: Space;
  Message: Message[];
};

export type Message = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  chat: Chat;
  chatId: string;
  sender: User;
  senderId: string;
  seenBy: User[];
};

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

export interface SubTask {
  id: string;
  title: string;
  assignees: User[];
  status: TaskStatus;
  priority?: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  task: Task;
  taskId: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  authorId: string;
  task: Task;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  assignees: User[];
  priority?: TaskPriority;
  dueDate?: Date;
  status?: TaskStatus;
  Comments: Comment[];
  description?: string;
  space: Space;
  spaceId: string;
  pr?: PullRequest;
  createdAt: Date;
  updatedAt: Date;
  SubTasks: SubTask[];
  order: number;
}

export enum TaskStatus {
  TO_DO = "TO_DO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
}

export enum TaskPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}
