"use client";

import Image from "next/image";
import { AlertCircle, Check, ImagePlus, LoaderCircle, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Template } from "@/lib/types";
import { useTasks } from "./TaskProvider";

type LocalFile = { file: File; url: string };

export function UploadComposer({ template }: { template: Template }) {
  const inputId = useId();
  const router = useRouter();
  const { registerTask } = useTasks();
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [failureStage, setFailureStage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filesRef = useRef<LocalFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => () => filesRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  const chooseFiles = (selected: FileList | null) => {
    if (!selected) return;
    setError("");
    const replaceIndex = replaceIndexRef.current;
    replaceIndexRef.current = null;
    const next = Array.from(selected).slice(0, replaceIndex === null ? template.requiredImageCount - files.length : 1);
    const invalid = next.find((file) => !template.acceptedMimeTypes.includes(file.type) || file.size > template.maxFileSizeBytes);
    if (invalid) {
      setError(`“${invalid.name}”的类型或大小不符合要求`);
      return;
    }
    if (replaceIndex !== null && next[0]) {
      setFiles((current) => {
        URL.revokeObjectURL(current[replaceIndex].url);
        return current.map((item, index) => index === replaceIndex
          ? { file: next[0], url: URL.createObjectURL(next[0]) }
          : item);
      });
      return;
    }
    setFiles((current) => [...current, ...next.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const replace = (index: number) => {
    replaceIndexRef.current = index;
    inputRef.current?.click();
  };

  const remove = (index: number) => setFiles((current) => {
    URL.revokeObjectURL(current[index].url);
    return current.filter((_, itemIndex) => itemIndex !== index);
  });

  const submit = async () => {
    if (files.length !== template.requiredImageCount || busy) return;
    setBusy(true);
    setError("");
    try {
      const assets = await api.uploadAssets(template.id, files.map((item) => item.file));
      const task = await api.createTask(template.id, assets.map((asset) => asset.id), failureStage);
      registerTask(task);
      router.push(`/history?focus=${task.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "提交失败，请稍后再试");
      setBusy(false);
    }
  };

  return (
    <section className="composer-panel" aria-labelledby="upload-title">
      <div className="panel-heading"><span className="step-number">01</span><div><h2 id="upload-title">上传你的素材</h2><p>按顺序添加图片，提交后可以离开此页面。</p></div></div>
      <div className="upload-grid">
        {Array.from({ length: template.requiredImageCount }, (_, index) => {
          const item = files[index];
          return item ? (
            <div className="upload-slot has-image" key={item.url}>
              <Image src={item.url} alt={`已选择素材 ${index + 1}`} fill unoptimized />
              <span className="slot-index">{index + 1}</span>
              <div className="slot-actions">
                <button type="button" onClick={() => replace(index)} disabled={busy} aria-label={`替换第 ${index + 1} 张图片`}><RefreshCw size={16} /></button>
                <button type="button" onClick={() => remove(index)} disabled={busy} aria-label={`移除第 ${index + 1} 张图片`}><Trash2 size={16} /></button>
              </div>
            </div>
          ) : (
            <label className="upload-slot" htmlFor={inputId} key={index}>
              <span className="upload-icon"><ImagePlus aria-hidden="true" size={22} /></span>
              <strong>添加第 {index + 1} 张图片</strong>
              <small>JPG / PNG / WebP</small>
            </label>
          );
        })}
      </div>
      <input ref={inputRef} id={inputId} className="sr-only" type="file" accept={template.acceptedMimeTypes.join(",")} multiple disabled={busy} onChange={(event) => {
        chooseFiles(event.target.files);
        event.currentTarget.value = "";
      }} />
      <div className="upload-requirements">
        <span><Check size={15} />需要 {template.requiredImageCount} 张</span>
        <span><Check size={15} />单张不超过 {Math.round(template.maxFileSizeBytes / 1024 / 1024)} MB</span>
        <span><Check size={15} />服务端再次校验</span>
      </div>

      <div className="simulation-control">
        <label htmlFor="failure-stage">演示结果</label>
        <select id="failure-stage" value={failureStage} onChange={(event) => setFailureStage(event.target.value)} disabled={busy}>
          <option value="">正常完成</option>
          <option value="VALIDATING">素材检查失败</option>
          <option value="GENERATING">模拟生成失败</option>
          <option value="FINALIZING">结果整理失败</option>
        </select>
        <p>用于验收指定阶段失败；正式页面不会随机失败。</p>
      </div>

      {error && <div className="form-error" role="alert"><AlertCircle aria-hidden="true" size={18} /><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="关闭错误提示"><X size={16} /></button></div>}
      <button className="primary-button submit-button" type="button" disabled={files.length !== template.requiredImageCount || busy} onClick={submit}>
        {busy ? <><LoaderCircle className="spin" size={18} />正在提交...</> : <><UploadCloud size={18} />开始制作</>}
      </button>
    </section>
  );
}
