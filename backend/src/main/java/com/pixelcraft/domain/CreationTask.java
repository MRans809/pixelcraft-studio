package com.pixelcraft.domain;

import java.time.LocalDateTime;

public record CreationTask(
        String id,
        String userId,
        String templateId,
        String templateTitle,
        String status,
        String stage,
        int progress,
        String failureStage,
        String failureReason,
        String resultUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

