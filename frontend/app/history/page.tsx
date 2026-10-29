"use client";

import { useSearchParams } from "next/navigation";
import { Clock3, LoaderCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { useTasks } from "@/components/TaskProvider";

function HistoryContent() {
  const { tasks, loaded, listError, queryErrors, refresh } = useTasks();
  const params = useSearchParams();
  const focus = params.get("focus");
  useEffect(() => {
    if (!focus) return;
    const timer = window.setTimeout(() => document.getElementById(`task-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    return () => window.clearTimeout(timer);
  }, [focus, tasks.length]);

  return (
    <div className="history-page page-container">
      <section className="history-heading"><div><span className="eyebrow">PERSONAL ARCHIVE</span><h1>制作记录</h1><p>刷新页面后仍会从 Java 后端恢复任务，并继续跟踪未完成状态。</p></div><button type="button" className="secondary-button" onClick={() => void refresh()}><RefreshCw size={16} />刷新记录</button></section>
      {!loaded ? <div className="loading-state"><LoaderCircle className="spin" /><span>正在恢复个人记录</span></div> :
        listError ? <div className="error-state"><p>{listError}</p><button onClick={() => void refresh()}><RefreshCw size={16} />重新加载</button></div> :
          !tasks.length ? <div className="empty-state history-empty"><Clock3 /><h2>还没有制作记录</h2><p>从模板库选择一个模板开始制作。</p><Link href="/" className="primary-button">浏览模板</Link></div> :
            <div className="history-grid">{tasks.map((task) => <div id={`task-${task.id}`} key={task.id} className={focus === task.id ? "focused-task" : ""}><TaskCard task={task} queryError={queryErrors[task.id]} /></div>)}</div>}
    </div>
  );
}

export default function HistoryPage() {
  return <Suspense fallback={<div className="loading-state"><LoaderCircle className="spin" /></div>}><HistoryContent /></Suspense>;
}
