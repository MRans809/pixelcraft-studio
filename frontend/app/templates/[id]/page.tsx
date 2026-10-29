"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Template } from "@/lib/types";
import { UploadComposer } from "@/components/UploadComposer";

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try { setTemplate(await api.getTemplate(id)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "模板加载失败"); }
  }, [id]);
  useEffect(() => {
    let active = true;

    api.getTemplate(id)
      .then((data) => { if (active) setTemplate(data); })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "模板加载失败");
      });

    return () => { active = false; };
  }, [id]);

  if (error) return <div className="centered-page"><div className="error-state"><p>{error}</p><button onClick={() => void load()}><RefreshCw size={16} />重新加载</button><Link href="/">返回模板列表</Link></div></div>;
  if (!template) return <div className="centered-page"><div className="loading-state"><LoaderCircle className="spin" /><span>正在读取模板</span></div></div>;

  return (
    <div className="detail-page">
      <div className="detail-toolbar"><Link href="/" className="back-link"><ArrowLeft size={17} />返回模板库</Link><span>{template.category}</span></div>
      <section className="detail-layout">
        <div className="template-showcase">
          <div className="showcase-image"><Image src={template.coverUrl} alt={`${template.title}示例效果`} fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <div className="showcase-copy"><span className="eyebrow">{template.category}</span><h1>{template.title}</h1><p>{template.description}</p></div>
          <div className="process-list">
            <div><span><CheckCircle2 size={17} /></span><p><strong>素材检查</strong><small>数量、格式与大小校验</small></p></div>
            <div><span>02</span><p><strong>模拟生成</strong><small>可调耗时的后台处理</small></p></div>
            <div><span>03</span><p><strong>结果整理</strong><small>持久化结果并进入历史记录</small></p></div>
          </div>
          <p className="privacy-note"><ShieldCheck size={17} />上传文件仅用于本次演示制作，并按演示用户隔离保存。</p>
        </div>
        <UploadComposer template={template} />
      </section>
    </div>
  );
}

