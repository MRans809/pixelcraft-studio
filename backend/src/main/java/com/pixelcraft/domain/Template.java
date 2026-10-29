package com.pixelcraft.domain;

import java.time.LocalDateTime;

public record Template(
        String id,
        String title,
        String category,
        String coverUrl,
        String description,
        int requiredImageCount,
        String acceptedMimeTypes,
        long maxFileSizeBytes,
        LocalDateTime createdAt
) {}

