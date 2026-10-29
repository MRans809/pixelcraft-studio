package com.pixelcraft.api.dto;

import com.pixelcraft.domain.Template;

import java.util.List;

public record TemplateResponse(
        String id,
        String title,
        String category,
        String coverUrl,
        String description,
        int requiredImageCount,
        List<String> acceptedMimeTypes,
        long maxFileSizeBytes
) {
    public static TemplateResponse from(Template template) {
        return new TemplateResponse(
                template.id(), template.title(), template.category(), template.coverUrl(),
                template.description(), template.requiredImageCount(),
                List.of(template.acceptedMimeTypes().split(",")), template.maxFileSizeBytes()
        );
    }
}

