package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.CompanyResponse;
import com.campusplacement.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getVerifiedCompanies() {
        List<CompanyResponse> companies = companyService.getAllVerifiedCompanies();
        return ResponseEntity.ok(ApiResponse.success("Verified companies retrieved", companies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable Long id) {
        CompanyResponse company = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success("Company profile retrieved", company));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getMyCompany(@AuthenticationPrincipal UserDetails userDetails) {
        CompanyResponse company = companyService.getCompanyByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Recruiter company profile retrieved", company));
    }
}
