package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.JobCreateRequest;
import com.campusplacement.dto.JobResponse;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import com.campusplacement.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponse>>> getJobs(
            @RequestParam(required = false) JobStream stream,
            @RequestParam(required = false) String search) {
        List<JobResponse> jobs = jobService.getActiveJobs(stream, search);
        return ResponseEntity.ok(ApiResponse.success("Job listings retrieved", jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(@PathVariable Long id) {
        JobResponse job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success("Job details retrieved", job));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JobCreateRequest request) {
        JobResponse job = jobService.createJob(userDetails.getUsername(), request);
        return new ResponseEntity<>(ApiResponse.success("Job posting published successfully", job), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JobCreateRequest request) {
        JobResponse job = jobService.updateJob(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Job posting updated", job));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam JobStatus status) {
        JobResponse job = jobService.updateJobStatus(id, userDetails.getUsername(), status);
        return ResponseEntity.ok(ApiResponse.success("Job status updated", job));
    }

    @GetMapping("/recruiter/my-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getMyPostedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        List<JobResponse> jobs = jobService.getJobsByRecruiter(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Recruiter jobs retrieved", jobs));
    }
}
