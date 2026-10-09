package com.campusplacement.service;

import com.campusplacement.dto.JobCreateRequest;
import com.campusplacement.dto.JobResponse;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import java.util.List;

public interface JobService {
    List<JobResponse> getActiveJobs(JobStream stream, String search);
    JobResponse getJobById(Long id);
    JobResponse createJob(String recruiterEmail, JobCreateRequest request);
    JobResponse updateJob(Long jobId, String recruiterEmail, JobCreateRequest request);
    JobResponse updateJobStatus(Long jobId, String recruiterEmail, JobStatus status);
    List<JobResponse> getJobsByRecruiter(String recruiterEmail);
    boolean checkEligibility(Long studentProfileId, Long jobId);
}
