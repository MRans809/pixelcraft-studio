package com.pixelcraft.service;

import com.pixelcraft.api.ApiException;
import com.pixelcraft.api.dto.AssetResponse;
import com.pixelcraft.domain.Asset;
import com.pixelcraft.domain.Template;
import com.pixelcraft.persistence.AssetMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AssetService {
    private final AssetMapper assetMapper;
    private final TemplateService templateService;
    private final Path uploadRoot;

    public AssetService(AssetMapper assetMapper, TemplateService templateService,
                        @Value("${app.upload-dir}") String uploadDir) {
        this.assetMapper = assetMapper;
        this.templateService = templateService;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public List<AssetResponse> upload(String userId, String templateId, List<MultipartFile> files) {
        Template template = templateService.getRequired(templateId);
        if (files == null || files.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_UPLOAD", "请选择需要上传的图片");
        }
        if (files.size() > template.requiredImageCount()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOO_MANY_FILES",
                    "该模板最多需要 " + template.requiredImageCount() + " 张图片");
        }
        Set<String> allowed = Set.of(template.acceptedMimeTypes().split(","));
        List<AssetResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            String mimeType = file.getContentType();
            if (file.isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "上传文件不能为空");
            }
            if (mimeType == null || !allowed.contains(mimeType)) {
                throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "INVALID_FILE_TYPE",
                        "仅支持 JPG、PNG 或 WebP 图片");
            }
            if (file.getSize() > template.maxFileSizeBytes()) {
                throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE",
                        "单张图片不能超过 " + template.maxFileSizeBytes() / 1024 / 1024 + " MB");
            }
            responses.add(store(userId, templateId, file, mimeType));
        }
        return responses;
    }

    private AssetResponse store(String userId, String templateId, MultipartFile file, String mimeType) {
        String id = UUID.randomUUID().toString();
        String extension = switch (mimeType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        Path target = uploadRoot.resolve(userId).resolve(id + extension).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PATH", "文件路径不合法");
        }
        try {
            Files.createDirectories(target.getParent());
            try (var input = file.getInputStream()) {
                Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED", "文件保存失败");
        }
        String originalName = file.getOriginalFilename() == null ? "image" + extension : file.getOriginalFilename();
        Asset asset = new Asset(id, userId, templateId, originalName, mimeType, file.getSize(),
                target.toString(), LocalDateTime.now());
        assetMapper.insert(asset);
        return new AssetResponse(id, originalName, mimeType, file.getSize(), "/api/assets/" + id + "/content");
    }

    public Asset getOwned(String userId, String id) {
        Asset asset = assetMapper.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "ASSET_NOT_FOUND", "素材不存在"));
        if (!asset.userId().equals(userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "ASSET_NOT_FOUND", "素材不存在");
        }
        return asset;
    }

    public Path getReadablePath(Asset asset) {
        Path path = Path.of(asset.storagePath()).toAbsolutePath().normalize();
        if (!path.startsWith(uploadRoot) || !Files.isRegularFile(path)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "ASSET_CONTENT_MISSING", "素材文件不可用");
        }
        return path;
    }
}

