"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { api } from "@/lib/api";
import { initialTaskState, isActiveTask, taskReducer } from "@/lib/task-state";
import type { CreationTask } from "@/lib/types";

type TaskContextValue = {
  tasks: CreationTask[];
  loaded: boolean;
  listError?: string;
  queryErrors: Record<string, string>;
  registerTask: (task: CreationTask) => void;
  refresh: () => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  const refresh = useCallback(async () => {
    try {
      dispatch({ type: "hydrate", tasks: await api.listTasks() });
    } catch (error) {
      dispatch({ type: "listError", message: error instanceof Error ? error.message : "历史记录加载失败" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeIds = state.order.filter((id) => state.tasks[id] && isActiveTask(state.tasks[id])).join(",");
  useEffect(() => {
    if (!activeIds) return;
    let disposed = false;
    const ids = activeIds.split(",");
    const poll = async () => {
      await Promise.all(ids.map(async (id) => {
        try {
          const updated = await api.getTask(id);
          if (!disposed) dispatch({ type: "upsert", task: updated });
        } catch (error) {
          if (!disposed) {
            dispatch({
              type: "queryError",
              taskId: id,
              message: error instanceof Error ? error.message : "状态查询暂时失败",
            });
          }
        }
      }));
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 1500);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [activeIds]);

  const value = useMemo<TaskContextValue>(() => ({
    tasks: state.order.map((id) => state.tasks[id]).filter(Boolean),
    loaded: state.loaded,
    listError: state.listError,
    queryErrors: state.queryErrors,
    registerTask: (task) => dispatch({ type: "upsert", task }),
    refresh,
  }), [state, refresh]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) throw new Error("useTasks must be used within TaskProvider");
  return value;
}

