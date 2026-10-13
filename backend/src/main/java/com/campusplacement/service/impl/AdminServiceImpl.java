package com.campusplacement.service.impl;

import com.campusplacement.dto.AdminDashboardStatsResponse;
import com.campusplacement.dto.CompanyResponse;
import com.campusplacement.dto.StudentProfileResponse;
import com.campusplacement.entity.AuditLog;
import com.campusplacement.entity.Company;
import com.campusplacement.entity.StudentProfile;
import com.campusplacement.enums.ApplicationStatus;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.Role;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.repository.*;
import com.campusplacement.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            StudentProfileRepository studentProfileRepository,
                            CompanyRepository companyRepository,
                            JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        long placedStudents = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        long activeCompanies = companyRepository.countByIsVerified(true);
        long pendingCompanies = companyRepository.countByIsVerified(false);
        long activeJobs = jobRepository.countByStatus(JobStatus.ACTIVE);
        long totalApplications = applicationRepository.count();

        String placementRate = totalStudents > 0
                ? String.format("%.1f%%", ((double) placedStudents / totalStudents) * 100)
                : "0.0%";

        return new AdminDashboardStatsResponse(
                totalStudents,
                placedStudents,
                activeCompanies,
                pendingCompanies,
                activeJobs,
                totalApplications,
                placementRate
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompaniesByVerification(Boolean isVerified) {
        List<Company> list;
        if (isVerified == null) {
            list = companyRepository.findAll();
        } else {
            list = companyRepository.findByIsVerified(isVerified);
        }
        return list.stream().map(this::mapCompanyToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CompanyResponse verifyCompany(Long companyId, boolean verify) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        company.setVerified(verify);
        Company saved = companyRepository.save(company);

        // Record Audit Log
        AuditLog log = new AuditLog(
                verify ? "COMPANY_VERIFIED" : "COMPANY_REJECTED",
                "admin@campus.edu",
                "Company",
                companyId,
                "Company " + company.getCompanyName() + " verification status changed to " + verify
        );
        auditLogRepository.save(log);

        return mapCompanyToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProfileResponse> getAllStudents() {
        return studentProfileRepository.findAll().stream()
                .map(this::mapStudentToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    private CompanyResponse mapCompanyToResponse(Company company) {
        CompanyResponse res = new CompanyResponse();
        res.setId(company.getId());
        res.setUserId(company.getUser() != null ? company.getUser().getId() : null);
        res.setCompanyName(company.getCompanyName());
        res.setIndustry(company.getIndustry());
        res.setWebsite(company.getWebsite());
        res.setLocation(company.getLocation());
        res.setLogoUrl(company.getLogoUrl());
        res.setVerified(company.isVerified());
        res.setDescription(company.getDescription());
        res.setCreatedAt(company.getCreatedAt());
        return res;
    }

    private StudentProfileResponse mapStudentToResponse(StudentProfile profile) {
        StudentProfileResponse res = new StudentProfileResponse();
        res.setId(profile.getId());
        res.setUserId(profile.getUser().getId());
        res.setEmail(profile.getUser().getEmail());
        res.setFullName(profile.getFullName());
        res.setPhone(profile.getPhone());
        res.setGender(profile.getGender());
        res.setCgpa(profile.getCgpa());
        res.setBranch(profile.getBranch());
        res.setGraduationYear(profile.getGraduationYear());
        if (profile.getResumeStorageName() != null) {
            res.setResumeUrl("/api/v1/students/" + profile.getUser().getId() + "/resume/download");
        } else {
            res.setResumeUrl(profile.getResumeUrl());
        }
        res.setResumeFileName(profile.getResumeFileName());
        res.setResumeFileSize(profile.getResumeFileSize());
        res.setResumeContentType(profile.getResumeContentType());
        res.setResumeUploadedAt(profile.getResumeUploadedAt());
        res.setSkillsJson(profile.getSkillsJson());
        res.setCreatedAt(profile.getCreatedAt());
        return res;
    }
}
