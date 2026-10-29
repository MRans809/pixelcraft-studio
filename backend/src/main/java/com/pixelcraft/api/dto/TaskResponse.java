package com.pixelcraft.api.dto;

import com.pixelcraft.domain.CreationTask;
import com.pixelcraft.domain.TaskStage;

import java.time.LocalDateTime;

public record TaskResponse(
        String id,
        String templateId,
        String templateTitle,
        String status,
        String stage,
        String stageLabel,
        int progress,
        String failureReason,
        String resultUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TaskResponse from(CreationTask task) {
        String stageLabel;
        try {
            stageLabel = TaskStage.valueOf(task.stage()).getLabel();
        } catch (RuntimeException ignored) {
            stageLabel = task.stage();
        }
        return new TaskResponse(task.id(), task.templateId(), task.templateTitle(), task.status(),
                task.stage(), stageLabel, task.progress(), task.failureReason(), task.resultUrl(),
                task.createdAt(), task.updatedAt());
    }
}

