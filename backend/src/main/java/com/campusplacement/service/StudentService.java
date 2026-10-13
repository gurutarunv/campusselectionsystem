package com.campusplacement.service;

import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.dto.StudentProfileRequest;
import com.campusplacement.dto.StudentProfileResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface StudentService {
    StudentProfileResponse getProfileByEmail(String email);
    StudentProfileResponse getProfileByUserId(Long userId);
    StudentProfileResponse updateProfile(String email, StudentProfileRequest request);
    List<ApplicationResponse> getMyApplications(String email);

    // Resume methods
    StudentProfileResponse uploadResume(String email, MultipartFile file);
    Resource getResumeResource(String email);
    String getResumeOriginalFileName(String email);
    Resource getResumeResourceByUserId(Long userId);
    String getResumeOriginalFileNameByUserId(Long userId);
    void deleteResume(String email);
}
