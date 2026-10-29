package com.pixelcraft.api;

import com.pixelcraft.api.dto.CreateTaskRequest;
import com.pixelcraft.api.dto.TaskResponse;
import com.pixelcraft.service.TaskService;
import com.pixelcraft.service.UserIdentity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public TaskResponse create(
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @Valid @RequestBody CreateTaskRequest request) {
        return taskService.create(UserIdentity.resolve(userHeader), request);
    }

    @GetMapping
    public List<TaskResponse> list(@RequestHeader(value = "X-User-Id", required = false) String userHeader) {
        return taskService.list(UserIdentity.resolve(userHeader));
    }

    @GetMapping("/{id}")
    public TaskResponse detail(
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @PathVariable String id) {
        return taskService.get(UserIdentity.resolve(userHeader), id);
    }
}

