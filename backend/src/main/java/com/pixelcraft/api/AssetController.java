package com.pixelcraft.api;

import com.pixelcraft.api.dto.AssetResponse;
import com.pixelcraft.domain.Asset;
import com.pixelcraft.service.AssetService;
import com.pixelcraft.service.UserIdentity;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<AssetResponse> upload(
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @RequestParam String templateId,
            @RequestPart("files") List<MultipartFile> files) {
        return assetService.upload(UserIdentity.resolve(userHeader), templateId, files);
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<FileSystemResource> content(
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @PathVariable String id) {
        Asset asset = assetService.getOwned(UserIdentity.resolve(userHeader), id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(asset.mimeType()))
                .header("Cache-Control", "private, max-age=3600")
                .body(new FileSystemResource(assetService.getReadablePath(asset)));
    }
}

