"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { Template } from "@/lib/types";

export function TemplateGrid({ templates }: { templates: Template[] }) {
  if (!templates.length) {
    return <div className="empty-state"><ImageIcon aria-hidden="true" /><h3>这个分类暂时没有模板</h3><p>切换其他分类继续浏览。</p></div>;
  }
  return (
    <div className="template-grid">
      {templates.map((template, index) => (
        <Link href={`/templates/${template.id}`} className="template-card" key={template.id}>
          <div className="template-cover">
            <Image src={template.coverUrl} alt={`${template.title}模板示例`} fill priority={index < 4} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw" />
            <span className="asset-count"><ImageIcon aria-hidden="true" size={14} /> {template.requiredImageCount} 张素材</span>
          </div>
          <div className="template-meta">
            <div><span>{template.category}</span><h3>{template.title}</h3></div>
            <span className="open-template" aria-hidden="true"><ArrowUpRight size={18} /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}

