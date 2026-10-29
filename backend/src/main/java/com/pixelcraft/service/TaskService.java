package com.pixelcraft.service;

import com.pixelcraft.api.ApiException;
import com.pixelcraft.api.dto.CreateTaskRequest;
import com.pixelcraft.api.dto.TaskResponse;
import com.pixelcraft.domain.Asset;
import com.pixelcraft.domain.CreationTask;
import com.pixelcraft.domain.TaskStage;
import com.pixelcraft.domain.TaskStatus;
import com.pixelcraft.domain.Template;
import com.pixelcraft.persistence.AssetMapper;
import com.pixelcraft.persistence.TaskMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private static final Set<String> FAILURE_STAGES = Set.of("", "VALIDATING", "GENERATING", "FINALIZING");

    private final TaskMapper taskMapper;
    private final AssetMapper assetMapper;
    private final TemplateService templateService;
    private final TaskProcessor taskProcessor;

    public TaskService(TaskMapper taskMapper, AssetMapper assetMapper, TemplateService templateService,
                       TaskProcessor taskProcessor) {
        this.taskMapper = taskMapper;
        this.assetMapper = assetMapper;
        this.templateService = templateService;
        this.taskProcessor = taskProcessor;
    }

    public TaskResponse create(String userId, CreateTaskRequest request) {
        Template template = templateService.getRequired(request.templateId());
        if (request.assetIds().stream().distinct().count() != request.assetIds().size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ASSETS", "素材 ID 不能重复");
        }
        List<Asset> foundAssets = assetMapper.findOwnedByIds(userId, request.assetIds());
        if (foundAssets.size() != request.assetIds().size() || foundAssets.stream().anyMatch(a -> !a.templateId().equals(template.id()))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ASSETS", "素材不存在、重复或不属于当前模板");
        }
        Map<String, Asset> assetsById = foundAssets.stream()
                .collect(Collectors.toMap(Asset::id, Function.identity()));
        List<Asset> assets = request.assetIds().stream().map(assetsById::get).toList();
        if (assets.size() != template.requiredImageCount()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "IMAGE_COUNT_MISMATCH",
                    "该模板需要上传 " + template.requiredImageCount() + " 张图片");
        }
        String failureStage = normalizeFailureStage(request.simulateFailureStage());
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        CreationTask task = new CreationTask(id, userId, template.id(), template.title(),
                TaskStatus.QUEUED.name(), TaskStage.WAITING.name(), TaskStage.WAITING.getProgress(),
                failureStage.isBlank() ? null : failureStage, null, null, now, now);
        taskMapper.insert(task);
        for (int index = 0; index < assets.size(); index++) {
            taskMapper.attachAsset(id, assets.get(index).id(), index);
        }
        taskProcessor.process(id, failureStage);
        return TaskResponse.from(task);
    }

    public TaskResponse get(String userId, String taskId) {
        return taskMapper.findOwnedById(taskId, userId).map(TaskResponse::from).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "任务不存在"));
    }

    public List<TaskResponse> list(String userId) {
        return taskMapper.findAllByUser(userId).stream().map(TaskResponse::from).toList();
    }

    private String normalizeFailureStage(String stage) {
        String normalized = stage == null ? "" : stage.trim().toUpperCase();
        if (!FAILURE_STAGES.contains(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FAILURE_STAGE",
                    "失败阶段仅支持 VALIDATING、GENERATING 或 FINALIZING");
        }
        return normalized;
    }
}

