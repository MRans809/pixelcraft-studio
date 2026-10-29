package com.pixelcraft.api;

import com.pixelcraft.api.dto.UserResponse;
import com.pixelcraft.service.UserIdentity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class UserController {
    @GetMapping
    public UserResponse me(@RequestHeader(value = "X-User-Id", required = false) String userHeader) {
        String userId = UserIdentity.resolve(userHeader);
        return new UserResponse(userId, "演示创作者", "demo@pixelcraft.local", "X-User-Id 演示身份");
    }
}

