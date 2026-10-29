"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Check, Clock3, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";
import type { CreationTask } from "@/lib/types";

const formatTime = (value: string) => new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
}).format(new Date(value));

export function TaskCard({ task, queryError }: { task: CreationTask; queryError?: string }) {
  const active = task.status === "QUEUED" || task.status === "PROCESSING";
  const succeeded = task.status === "SUCCEEDED";
  const failed = task.status === "FAILED";
  return (
    <article className={`task-card ${failed ? "task-failed" : ""}`}>
      <div className="result-preview">
        {succeeded && task.resultUrl ? (
          <Image src={task.resultUrl} alt={`${task.templateTitle}制作结果`} fill unoptimized sizes="(max-width: 720px) 100vw, 320px" />
        ) : (
          <div className="result-placeholder">
            {failed ? <AlertCircle aria-hidden="true" /> : active ? <LoaderCircle className="spin" aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
            <span>{failed ? "制作未完成" : task.stageLabel}</span>
          </div>
        )}
        <span className={`status-badge status-${task.status.toLowerCase()}`}>
          {succeeded ? <Check size={13} /> : active ? <LoaderCircle size={13} /> : <AlertCircle size={13} />}
          {succeeded ? "已完成" : failed ? "失败" : task.status === "QUEUED" ? "等待中" : "制作中"}
        </span>
      </div>
      <div className="task-content">
        <div><span className="task-time">{formatTime(task.createdAt)}</span><h3>{task.templateTitle}</h3></div>
        {active && <div className="progress-track" aria-label={`制作进度 ${task.progress}%`}><span style={{ width: `${task.progress}%` }} /></div>}
        <p className={failed ? "failure-copy" : "stage-copy"}>{failed ? task.failureReason : succeeded ? "结果已安全保存到个人记录" : `${task.stageLabel} · ${task.progress}%`}</p>
        {queryError && <p className="query-warning"><WifiOff aria-hidden="true" size={15} />{queryError}，将继续尝试</p>}
        <div className="task-actions">
          <Link href={`/templates/${task.templateId}`}>{succeeded ? "再次制作" : "查看模板"}</Link>
          {queryError && <button type="button" onClick={() => window.location.reload()} aria-label="刷新并恢复任务查询"><RefreshCw size={15} />刷新</button>}
        </div>
      </div>
    </article>
  );
}

