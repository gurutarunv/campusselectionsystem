package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.dto.StudentProfileRequest;
import com.campusplacement.dto.StudentProfileResponse;
import com.campusplacement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> uploadMyResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        StudentProfileResponse updated = studentService.uploadResume(userDetails.getUsername(), file);
        return ResponseEntity.ok(ApiResponse.success("Resume PDF uploaded successfully", updated));
    }

    @GetMapping("/resume/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> downloadMyResume(@AuthenticationPrincipal UserDetails userDetails) {
        Resource resource = studentService.getResumeResource(userDetails.getUsername());
        String originalFileName = studentService.getResumeOriginalFileName(userDetails.getUsername());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(originalFileName).build());

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    @GetMapping("/resume/preview")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> previewMyResume(@AuthenticationPrincipal UserDetails userDetails) {
        Resource resource = studentService.getResumeResource(userDetails.getUsername());
        String originalFileName = studentService.getResumeOriginalFileName(userDetails.getUsername());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(originalFileName).build());

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    @DeleteMapping("/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> deleteMyResume(@AuthenticationPrincipal UserDetails userDetails) {
        studentService.deleteResume(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", null));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getStudentById(@PathVariable Long userId) {
        StudentProfileResponse profile = studentService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Candidate profile retrieved", profile));
    }

    @GetMapping("/{userId}/resume/download")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Resource> downloadCandidateResume(@PathVariable Long userId) {
        Resource resource = studentService.getResumeResourceByUserId(userId);
        String originalFileName = studentService.getResumeOriginalFileNameByUserId(userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(originalFileName).build());

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    @GetMapping("/{userId}/resume/preview")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Resource> previewCandidateResume(@PathVariable Long userId) {
        Resource resource = studentService.getResumeResourceByUserId(userId);
        String originalFileName = studentService.getResumeOriginalFileNameByUserId(userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(originalFileName).build());

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    @GetMapping("/me/applications")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationResponse> applications = studentService.getMyApplications(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }
}
