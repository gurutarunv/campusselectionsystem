package com.campusplacement.service;

import com.campusplacement.dto.AdminDashboardStatsResponse;
import com.campusplacement.dto.CompanyResponse;
import com.campusplacement.dto.StudentProfileResponse;
import com.campusplacement.entity.AuditLog;
import java.util.List;

public interface AdminService {
    AdminDashboardStatsResponse getDashboardStats();
    List<CompanyResponse> getCompaniesByVerification(Boolean isVerified);
    CompanyResponse verifyCompany(Long companyId, boolean verify);
    List<StudentProfileResponse> getAllStudents();
    List<AuditLog> getRecentAuditLogs();
}
