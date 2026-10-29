"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Layers3, LoaderCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Template } from "@/lib/types";
import { TemplateGrid } from "@/components/TemplateGrid";
import { useTasks } from "@/components/TaskProvider";

const categories = ["全部", "社交分享", "生活记录", "品牌视觉", "节日创意"];

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { tasks } = useTasks();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setTemplates(await api.listTemplates());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "模板加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api.listTemplates()
      .then((data) => { if (active) setTemplates(data); })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "模板加载失败");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);
  const visible = useMemo(() => category === "全部" ? templates : templates.filter((item) => item.category === category), [templates, category]);
  const activeCount = tasks.filter((task) => task.status === "QUEUED" || task.status === "PROCESSING").length;

  return (
    <div className="page-container">
      <section className="catalog-intro">
        <div>
          <span className="eyebrow">CREATIVE WORKSPACE</span>
          <h1>选择一个模板，<br />把想法变成作品。</h1>
          <p>上传你的图片，后台会按步骤完成素材检查、模拟生成和结果整理。</p>
        </div>
        <Link href="/history" className="activity-panel">
          <span className="activity-icon"><Layers3 aria-hidden="true" size={22} /></span>
          <span><small>当前任务</small><strong>{activeCount ? `${activeCount} 个正在处理` : "工作台已就绪"}</strong></span>
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>

      <section className="catalog-section" aria-labelledby="templates-title">
        <div className="section-heading"><div><span className="eyebrow">TEMPLATE LIBRARY</span><h2 id="templates-title">探索模板</h2></div><span className="result-count">{visible.length} 个模板</span></div>
        <div className="category-tabs" role="tablist" aria-label="模板分类">
          {categories.map((item) => (
            <button key={item} role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        {loading ? <div className="loading-state"><LoaderCircle className="spin" /><span>正在加载模板</span></div> :
          error ? <div className="error-state"><p>{error}</p><button type="button" onClick={() => void load()}><RefreshCw size={16} />重新加载</button></div> :
            <TemplateGrid templates={visible} />}
      </section>
    </div>
  );
}

