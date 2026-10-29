package com.pixelcraft.domain;

public enum TaskStage {
    WAITING("等待处理", 5),
    VALIDATING("素材检查", 25),
    GENERATING("模拟生成", 60),
    FINALIZING("结果整理", 88),
    COMPLETED("制作完成", 100);

    private final String label;
    private final int progress;

    TaskStage(String label, int progress) {
        this.label = label;
        this.progress = progress;
    }

    public String getLabel() {
        return label;
    }

    public int getProgress() {
        return progress;
    }
}

