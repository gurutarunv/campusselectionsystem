package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.ApplicationRequest;
import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.enums.ApplicationStatus;
import com.campusplacement.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) ApplicationRequest request) {
        ApplicationResponse response = applicationService.applyForJob(userDetails.getUsername(), jobId, request);
        return new ResponseEntity<>(ApiResponse.success("Application submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationResponse> list = applicationService.getApplicationsByJob(jobId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Job applications retrieved", list));
    }

    @GetMapping("/recruiter/my-pipeline")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getRecruiterPipeline(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationResponse> list = applicationService.getApplicationsByRecruiter(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Recruiter candidate pipeline retrieved", list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String comments) {
        ApplicationResponse updated = applicationService.updateApplicationStatus(id, userDetails.getUsername(), status, comments);
        return ResponseEntity.ok(ApiResponse.success("Candidate stage updated to " + status.name(), updated));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ApplicationResponse withdrawn = applicationService.withdrawApplication(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", withdrawn));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(@PathVariable Long id) {
        ApplicationResponse app = applicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success("Application details retrieved", app));
    }
}
