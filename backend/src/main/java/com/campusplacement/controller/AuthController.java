package com.campusplacement.controller;

import com.campusplacement.dto.ApiResponse;
import com.campusplacement.dto.AuthRequest;
import com.campusplacement.dto.AuthResponse;
import com.campusplacement.dto.RegisterCompanyRequest;
import com.campusplacement.dto.RegisterStudentRequest;
import com.campusplacement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse<AuthResponse>> registerStudent(@Valid @RequestBody RegisterStudentRequest request) {
        AuthResponse response = authService.registerStudent(request);
        return new ResponseEntity<>(ApiResponse.success("Student registration successful", response), HttpStatus.CREATED);
    }

    @PostMapping("/register/company")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCompany(@Valid @RequestBody RegisterCompanyRequest request) {
        AuthResponse response = authService.registerCompany(request);
        return new ResponseEntity<>(ApiResponse.success("Company registration successful", response), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        AuthResponse.UserInfo info = authService.getCurrentUserInfo(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved", info));
    }
}
