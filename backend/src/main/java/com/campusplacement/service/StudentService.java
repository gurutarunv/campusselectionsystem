package com.campusplacement.service;

import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.dto.StudentProfileRequest;
import com.campusplacement.dto.StudentProfileResponse;
import java.util.List;

public interface StudentService {
    StudentProfileResponse getProfileByEmail(String email);
    StudentProfileResponse getProfileByUserId(Long userId);
    StudentProfileResponse updateProfile(String email, StudentProfileRequest request);
    List<ApplicationResponse> getMyApplications(String email);
}
