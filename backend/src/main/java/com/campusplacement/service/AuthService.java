package com.campusplacement.service;

import com.campusplacement.dto.AuthRequest;
import com.campusplacement.dto.AuthResponse;
import com.campusplacement.dto.RegisterCompanyRequest;
import com.campusplacement.dto.RegisterStudentRequest;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse registerStudent(RegisterStudentRequest request);
    AuthResponse registerStudentWithResume(RegisterStudentRequest request, MultipartFile resumeFile);
    AuthResponse registerCompany(RegisterCompanyRequest request);
    AuthResponse.UserInfo getCurrentUserInfo(String email);
}
