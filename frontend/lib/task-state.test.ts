import { describe, expect, it } from "vitest";
import { initialTaskState, taskReducer } from "./task-state";
import type { CreationTask } from "./types";

const task = (id: string, status: CreationTask["status"], progress: number): CreationTask => ({
  id,
  status,
  progress,
  templateId: "postcard",
  templateTitle: "旅行明信片",
  stage: status === "FAILED" ? "GENERATING" : "VALIDATING",
  stageLabel: "素材检查",
  createdAt: "2026-10-28T12:00:00",
  updatedAt: "2026-10-28T12:00:00",
});

describe("taskReducer", () => {
  it("updates one task without contaminating another task", () => {
    const hydrated = taskReducer(initialTaskState, {
      type: "hydrate",
      tasks: [task("a", "PROCESSING", 25), task("b", "PROCESSING", 60)],
    });
    const next = taskReducer(hydrated, { type: "upsert", task: task("a", "SUCCEEDED", 100) });

    expect(next.tasks.a.status).toBe("SUCCEEDED");
    expect(next.tasks.b.status).toBe("PROCESSING");
    expect(next.tasks.b.progress).toBe(60);
  });

  it("keeps a query error separate from a backend task failure", () => {
    const failed = { ...task("a", "FAILED", 60), failureReason: "模拟生成失败" };
    const hydrated = taskReducer(initialTaskState, { type: "hydrate", tasks: [failed, task("b", "PROCESSING", 25)] });
    const next = taskReducer(hydrated, { type: "queryError", taskId: "b", message: "状态查询暂时失败" });

    expect(next.tasks.b.status).toBe("PROCESSING");
    expect(next.tasks.b.failureReason).toBeUndefined();
    expect(next.queryErrors.b).toBe("状态查询暂时失败");
    expect(next.tasks.a.failureReason).toBe("模拟生成失败");
  });
});
