package com.pixelcraft.service;

import com.pixelcraft.domain.TaskStage;
import com.pixelcraft.persistence.TaskMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TaskProcessor {
    private final TaskMapper taskMapper;
    private final long stageDelayMs;

    public TaskProcessor(TaskMapper taskMapper, @Value("${app.task-stage-delay-ms}") long stageDelayMs) {
        this.taskMapper = taskMapper;
        this.stageDelayMs = stageDelayMs;
    }

    @Async("taskExecutor")
    public void process(String taskId, String failureStage) {
        for (TaskStage stage : new TaskStage[]{TaskStage.VALIDATING, TaskStage.GENERATING, TaskStage.FINALIZING}) {
            taskMapper.updateStage(taskId, "PROCESSING", stage.name(), stage.getProgress());
            if (stage.name().equalsIgnoreCase(failureStage == null ? "" : failureStage)) {
                taskMapper.markFailed(taskId, stage.name(), failureMessage(stage));
                return;
            }
            if (!pause(taskId, stage)) {
                return;
            }
        }
        String firstAssetId = taskMapper.findFirstAssetId(taskId);
        taskMapper.markSucceeded(taskId, "/api/assets/" + firstAssetId + "/content");
    }

    private boolean pause(String taskId, TaskStage stage) {
        try {
            Thread.sleep(stageDelayMs);
            return true;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            taskMapper.markFailed(taskId, stage.name(), "后台处理被中断");
            return false;
        }
    }

    private String failureMessage(TaskStage stage) {
        return switch (stage) {
            case VALIDATING -> "模拟失败：素材清晰度不足，请更换图片";
            case GENERATING -> "模拟失败：生成服务暂时不可用";
            case FINALIZING -> "模拟失败：结果整理时写入失败";
            default -> "模拟处理失败";
        };
    }
}

