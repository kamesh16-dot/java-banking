package com.demo.bank.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiError {
    private String message;
    private int status;

    public static ApiError of(String message, int status) {
        return ApiError.builder().message(message).status(status).build();
    }
}
