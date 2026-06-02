package com.enterprisepm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EnterprisePmApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnterprisePmApplication.class, args);
    }
}
