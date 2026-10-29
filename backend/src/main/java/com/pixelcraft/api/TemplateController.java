package com.pixelcraft.api;

import com.pixelcraft.api.dto.TemplateResponse;
import com.pixelcraft.service.TemplateService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {
    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public List<TemplateResponse> list(@RequestParam(required = false) String category) {
        return templateService.list(category);
    }

    @GetMapping("/{id}")
    public TemplateResponse detail(@PathVariable String id) {
        return TemplateResponse.from(templateService.getRequired(id));
    }
}

