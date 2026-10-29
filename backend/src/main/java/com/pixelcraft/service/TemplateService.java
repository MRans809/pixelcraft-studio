package com.pixelcraft.service;

import com.pixelcraft.api.ApiException;
import com.pixelcraft.api.dto.TemplateResponse;
import com.pixelcraft.domain.Template;
import com.pixelcraft.persistence.TemplateMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplateService {
    private final TemplateMapper templateMapper;

    public TemplateService(TemplateMapper templateMapper) {
        this.templateMapper = templateMapper;
    }

    public List<TemplateResponse> list(String category) {
        return templateMapper.findAll(category).stream().map(TemplateResponse::from).toList();
    }

    public Template getRequired(String id) {
        return templateMapper.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "TEMPLATE_NOT_FOUND", "模板不存在或已下线"));
    }
}

