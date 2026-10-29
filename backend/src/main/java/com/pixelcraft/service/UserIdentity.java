package com.pixelcraft.service;

public final class UserIdentity {
    public static final String DEFAULT_USER_ID = "demo-user-001";

    private UserIdentity() {}

    public static String resolve(String header) {
        return header == null || header.isBlank() ? DEFAULT_USER_ID : header.trim();
    }
}

