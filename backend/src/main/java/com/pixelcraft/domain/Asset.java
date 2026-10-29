package com.pixelcraft.domain;

import java.time.LocalDateTime;

public record Asset(
        String id,
        String userId,
        String templateId,
        String originalName,
        String mimeType,
        long sizeBytes,
        String storagePath,
        LocalDateTime createdAt
) {}

