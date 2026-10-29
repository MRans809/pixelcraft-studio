package com.pixelcraft.api.dto;

public record AssetResponse(
        String id,
        String originalName,
        String mimeType,
        long sizeBytes,
        String previewUrl
) {}

