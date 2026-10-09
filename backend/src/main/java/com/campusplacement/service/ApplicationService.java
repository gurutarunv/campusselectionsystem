package com.campusplacement.service;

import com.campusplacement.dto.ApplicationRequest;
import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.enums.ApplicationStatus;
import java.util.List;

public interface ApplicationService {
    ApplicationResponse applyForJob(String studentEmail, Long jobId, ApplicationRequest request);
    ApplicationResponse updateApplicationStatus(Long applicationId, String recruiterEmail, ApplicationStatus newStatus, String comments);
    ApplicationResponse withdrawApplication(Long applicationId, String studentEmail);
    List<ApplicationResponse> getApplicationsByJob(Long jobId, String recruiterEmail);
    List<ApplicationResponse> getApplicationsByRecruiter(String recruiterEmail);
    ApplicationResponse getApplicationById(Long id);
}
