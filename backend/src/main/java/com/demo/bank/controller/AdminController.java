package com.demo.bank.controller;

import com.demo.bank.dto.*;
import com.demo.bank.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserResponse>> getCustomers(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getCustomers(search));
    }

    @PatchMapping("/accounts/{id}/status")
    public ResponseEntity<AccountResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleAccountStatus(id));
    }
}
