import type { CreationTask } from "./types";

export type TaskState = {
  tasks: Record<string, CreationTask>;
  order: string[];
  queryErrors: Record<string, string>;
  listError?: string;
  loaded: boolean;
};

export type TaskAction =
  | { type: "hydrate"; tasks: CreationTask[] }
  | { type: "upsert"; task: CreationTask }
  | { type: "queryError"; taskId: string; message: string }
  | { type: "listError"; message: string };

export const initialTaskState: TaskState = { tasks: {}, order: [], queryErrors: {}, loaded: false };

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  if (action.type === "hydrate") {
    return {
      tasks: Object.fromEntries(action.tasks.map((task) => [task.id, task])),
      order: action.tasks.map((task) => task.id),
      queryErrors: {},
      loaded: true,
    };
  }
  if (action.type === "upsert") {
    return {
      ...state,
      tasks: { ...state.tasks, [action.task.id]: action.task },
      order: state.order.includes(action.task.id) ? state.order : [action.task.id, ...state.order],
      queryErrors: Object.fromEntries(
        Object.entries(state.queryErrors).filter(([id]) => id !== action.task.id),
      ),
    };
  }
  if (action.type === "queryError") {
    return { ...state, queryErrors: { ...state.queryErrors, [action.taskId]: action.message } };
  }
  return { ...state, listError: action.message, loaded: true };
}

export const isActiveTask = (task: CreationTask) => task.status === "QUEUED" || task.status === "PROCESSING";

