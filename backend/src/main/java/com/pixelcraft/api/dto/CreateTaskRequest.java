package com.pixelcraft.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateTaskRequest(
        @NotBlank String templateId,
        @NotEmpty List<String> assetIds,
        String simulateFailureStage
) {}

