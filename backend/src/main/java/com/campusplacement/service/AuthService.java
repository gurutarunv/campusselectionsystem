package com.campusplacement.service;

import com.campusplacement.dto.AuthRequest;
import com.campusplacement.dto.AuthResponse;
import com.campusplacement.dto.RegisterCompanyRequest;
import com.campusplacement.dto.RegisterStudentRequest;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse registerStudent(RegisterStudentRequest request);
    AuthResponse registerCompany(RegisterCompanyRequest request);
    AuthResponse.UserInfo getCurrentUserInfo(String email);
}
