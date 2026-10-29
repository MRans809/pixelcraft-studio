"use client";

import { CircleUserRound, Database, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export function ProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    setLoading(true);
    setError("");
    void api.getMe()
      .then((data) => setUser(data))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "个人资料加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      void api.getMe()
        .then((data) => {
          setUser(data);
          setError("");
        })
        .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "个人资料加载失败"))
        .finally(() => setLoading(false));
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} className="profile-dialog" onClose={onClose} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="dialog-panel">
        <div className="dialog-heading">
          <div><span className="eyebrow">PERSONAL SPACE</span><h2>个人资料</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭个人资料">
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        {error && <div className="profile-error" role="alert"><span>{error}</span><button type="button" onClick={loadUser}>重新加载</button></div>}
        <div className="identity-card" aria-busy={loading}>
          <span className="identity-icon"><CircleUserRound aria-hidden="true" size={30} /></span>
          <div><strong>{user?.displayName ?? (error ? "资料暂不可用" : "加载中...")}</strong><p>{user?.email ?? (error ? "请重新加载" : "正在读取演示身份")}</p></div>
        </div>
        <div className="profile-row"><span>用户标识</span><code>{user?.id ?? "--"}</code></div>
        <div className="profile-row"><span>身份策略</span><strong>{user?.identityMode ?? "--"}</strong></div>
        <div className="identity-note">
          <Database aria-hidden="true" size={18} />
          <p>模板、上传素材与制作记录均由 Java 服务按用户标识隔离，并持久化到 MySQL。</p>
        </div>
      </div>
    </dialog>
  );
}

