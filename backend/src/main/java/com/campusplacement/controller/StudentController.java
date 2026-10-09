package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.dto.StudentProfileRequest;
import com.campusplacement.dto.StudentProfileResponse;
import com.campusplacement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        StudentProfileResponse profile = studentService.getProfileByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudentProfileRequest request) {
        StudentProfileResponse updated = studentService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/me/applications")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationResponse> applications = studentService.getMyApplications(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getStudentById(@PathVariable Long userId) {
        StudentProfileResponse profile = studentService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Candidate profile retrieved", profile));
    }
}
