package com.pixelcraft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class PixelCraftApplication {
    public static void main(String[] args) {
        SpringApplication.run(PixelCraftApplication.class, args);
    }
}

