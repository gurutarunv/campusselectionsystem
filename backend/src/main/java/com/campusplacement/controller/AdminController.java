package com.campusplacement.controller;

import com.campusplacement.dto.AdminDashboardStatsResponse;
import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.CompanyResponse;
import com.campusplacement.dto.StudentProfileResponse;
import com.campusplacement.entity.AuditLog;
import com.campusplacement.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Placement statistics calculated", stats));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompanies(
            @RequestParam(required = false) Boolean verified) {
        List<CompanyResponse> list = adminService.getCompaniesByVerification(verified);
        return ResponseEntity.ok(ApiResponse.success("Company registry retrieved", list));
    }

    @PatchMapping("/companies/{id}/verify")
    public ResponseEntity<ApiResponse<CompanyResponse>> verifyCompany(
            @PathVariable Long id,
            @RequestParam boolean verified) {
        CompanyResponse response = adminService.verifyCompany(id, verified);
        return ResponseEntity.ok(ApiResponse.success("Company verification status updated", response));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentProfileResponse>>> getAllStudents() {
        List<StudentProfileResponse> list = adminService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success("Registered students list retrieved", list));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = adminService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success("Placement audit logs retrieved", logs));
    }
}
