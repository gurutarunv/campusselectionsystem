package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.InterviewResponse;
import com.campusplacement.dto.InterviewScheduleRequest;
import com.campusplacement.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<InterviewResponse>> scheduleInterview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InterviewScheduleRequest request) {
        InterviewResponse response = interviewService.scheduleInterview(userDetails.getUsername(), request);
        return new ResponseEntity<>(ApiResponse.success("Interview scheduled and invitation sent", response), HttpStatus.CREATED);
    }

    @GetMapping("/my-schedule")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getMyInterviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<InterviewResponse> list = interviewService.getInterviewsByStudent(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Student interview schedule retrieved", list));
    }

    @GetMapping("/recruiter/my-interviews")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getRecruiterInterviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<InterviewResponse> list = interviewService.getInterviewsByRecruiter(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Recruiter scheduled interviews retrieved", list));
    }

    @PatchMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateFeedback(
            @PathVariable Long id,
            @RequestParam String feedbackNotes) {
        InterviewResponse response = interviewService.updateInterviewFeedback(id, feedbackNotes);
        return ResponseEntity.ok(ApiResponse.success("Interview feedback recorded", response));
    }
}
