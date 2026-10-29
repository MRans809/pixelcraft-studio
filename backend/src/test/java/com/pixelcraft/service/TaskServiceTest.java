package com.pixelcraft.service;

import com.pixelcraft.api.dto.CreateTaskRequest;
import com.pixelcraft.api.dto.TaskResponse;
import com.pixelcraft.domain.Asset;
import com.pixelcraft.domain.Template;
import com.pixelcraft.persistence.AssetMapper;
import com.pixelcraft.persistence.TaskMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    private final TaskMapper taskMapper = mock(TaskMapper.class);
    private final AssetMapper assetMapper = mock(AssetMapper.class);
    private final TemplateService templateService = mock(TemplateService.class);
    private final TaskProcessor taskProcessor = mock(TaskProcessor.class);
    private final TaskService service = new TaskService(taskMapper, assetMapper, templateService, taskProcessor);

    @Test
    void preservesRequestedAssetOrderWhenDatabaseReturnsRowsInAnotherOrder() {
        Template template = new Template("template-1", "双图模板", "测试", "/cover.svg", "说明",
                2, "image/png", 5_242_880, LocalDateTime.now());
        Asset first = asset("asset-1");
        Asset second = asset("asset-2");
        when(templateService.getRequired("template-1")).thenReturn(template);
        when(assetMapper.findOwnedByIds("user-1", List.of("asset-1", "asset-2")))
                .thenReturn(List.of(second, first));

        TaskResponse response = service.create("user-1",
                new CreateTaskRequest("template-1", List.of("asset-1", "asset-2"), null));

        verify(taskMapper).insert(any());
        verify(taskMapper).attachAsset(response.id(), "asset-1", 0);
        verify(taskMapper).attachAsset(response.id(), "asset-2", 1);
        verify(taskProcessor).process(response.id(), "");
    }

    private Asset asset(String id) {
        return new Asset(id, "user-1", "template-1", id + ".png", "image/png", 1024,
                "/tmp/" + id + ".png", LocalDateTime.now());
    }
}
