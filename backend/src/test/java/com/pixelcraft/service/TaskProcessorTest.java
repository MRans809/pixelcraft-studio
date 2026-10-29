package com.pixelcraft.service;

import com.pixelcraft.persistence.TaskMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InOrder;

import static org.mockito.Mockito.*;

class TaskProcessorTest {
    private final TaskMapper mapper = mock(TaskMapper.class);
    private final TaskProcessor processor = new TaskProcessor(mapper, 0);

    @Test
    void executesAllStagesInOrderAndCompletes() {
        when(mapper.findFirstAssetId("task-1")).thenReturn("asset-1");

        processor.process("task-1", "");

        InOrder order = inOrder(mapper);
        order.verify(mapper).updateStage("task-1", "PROCESSING", "VALIDATING", 25);
        order.verify(mapper).updateStage("task-1", "PROCESSING", "GENERATING", 60);
        order.verify(mapper).updateStage("task-1", "PROCESSING", "FINALIZING", 88);
        order.verify(mapper).findFirstAssetId("task-1");
        order.verify(mapper).markSucceeded("task-1", "/api/assets/asset-1/content");
    }

    @ParameterizedTest
    @ValueSource(strings = {"VALIDATING", "GENERATING", "FINALIZING"})
    void failureStopsAtEverySupportedStage(String failureStage) {
        processor.process("task-2", failureStage);

        InOrder order = inOrder(mapper);
        order.verify(mapper).updateStage("task-2", "PROCESSING", "VALIDATING", 25);
        if (!failureStage.equals("VALIDATING")) {
            order.verify(mapper).updateStage("task-2", "PROCESSING", "GENERATING", 60);
        }
        if (failureStage.equals("FINALIZING")) {
            order.verify(mapper).updateStage("task-2", "PROCESSING", "FINALIZING", 88);
        }
        order.verify(mapper).markFailed(eq("task-2"), eq(failureStage), contains("模拟失败"));
        if (failureStage.equals("VALIDATING")) {
            verify(mapper, never()).updateStage(eq("task-2"), eq("PROCESSING"), eq("GENERATING"), anyInt());
        }
        if (!failureStage.equals("FINALIZING")) {
            verify(mapper, never()).updateStage(eq("task-2"), eq("PROCESSING"), eq("FINALIZING"), anyInt());
        }
        verify(mapper, never()).markSucceeded(anyString(), anyString());
    }
}
