package com.campusplacement.service.impl;

import com.campusplacement.dto.JobCreateRequest;
import com.campusplacement.dto.JobResponse;
import com.campusplacement.entity.Company;
import com.campusplacement.entity.Job;
import com.campusplacement.entity.StudentProfile;
import com.campusplacement.entity.User;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.Role;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.exception.UnauthorizedException;
import com.campusplacement.repository.CompanyRepository;
import com.campusplacement.repository.JobRepository;
import com.campusplacement.repository.StudentProfileRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.service.JobService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    public JobServiceImpl(JobRepository jobRepository,
                          CompanyRepository companyRepository,
                          UserRepository userRepository,
                          StudentProfileRepository studentProfileRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getActiveJobs(JobStream stream, String search) {
        List<Job> jobs;
        if (StringUtils.hasText(search)) {
            jobs = jobRepository.searchJobs(JobStatus.ACTIVE, search);
            if (stream != null) {
                jobs = jobs.stream().filter(j -> j.getStream() == stream).collect(Collectors.toList());
            }
        } else if (stream != null) {
            jobs = jobRepository.findByStreamAndStatus(stream, JobStatus.ACTIVE);
        } else {
            jobs = jobRepository.findByStatus(JobStatus.ACTIVE);
        }
        return jobs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found with id: " + id));
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobResponse createJob(String recruiterEmail, JobCreateRequest request) {
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No company profile associated with recruiter account."));

        Job job = new Job(
                company,
                request.getTitle(),
                request.getStream(),
                request.getJobType(),
                request.getMinCgpa(),
                request.getEligibleBranches(),
                request.getLocation(),
                request.getSalaryPackage(),
                request.getDescription(),
                request.getRequiredSkills(),
                request.getApplicationDeadline()
        );

        Job savedJob = jobRepository.save(job);
        return mapToResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long jobId, String recruiterEmail, JobCreateRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        validateJobOwnership(job, recruiterEmail);

        job.setTitle(request.getTitle());
        job.setStream(request.getStream());
        job.setJobType(request.getJobType());
        job.setMinCgpa(request.getMinCgpa());
        job.setEligibleBranches(request.getEligibleBranches());
        job.setLocation(request.getLocation());
        job.setSalaryPackage(request.getSalaryPackage());
        job.setDescription(request.getDescription());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setApplicationDeadline(request.getApplicationDeadline());

        Job updated = jobRepository.save(job);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public JobResponse updateJobStatus(Long jobId, String recruiterEmail, JobStatus status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        validateJobOwnership(job, recruiterEmail);
        job.setStatus(status);

        Job updated = jobRepository.save(job);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByRecruiter(String recruiterEmail) {
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No company profile found for recruiter."));

        return jobRepository.findByCompanyId(company.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkEligibility(Long studentProfileId, Long jobId) {
        StudentProfile student = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // 1. CGPA Check
        if (student.getCgpa().compareTo(job.getMinCgpa()) < 0) {
            return false;
        }

        // 2. Branch Check
        String eligibleBranches = job.getEligibleBranches();
        if (StringUtils.hasText(eligibleBranches) && !eligibleBranches.equalsIgnoreCase("ALL")) {
            String studentBranch = student.getBranch().toLowerCase();
            boolean match = false;
            for (String b : eligibleBranches.split(",")) {
                String branchCode = b.trim().toLowerCase();
                if (studentBranch.contains(branchCode) || 
                    (branchCode.equals("cs") && (studentBranch.contains("computer") || studentBranch.contains("cse"))) ||
                    (branchCode.equals("it") && studentBranch.contains("information")) ||
                    (branchCode.equals("ece") && studentBranch.contains("electronics")) ||
                    (branchCode.equals("ee") && studentBranch.contains("electrical")) ||
                    (branchCode.equals("me") && studentBranch.contains("mechanical")) ||
                    (branchCode.equals("bio") && studentBranch.contains("bio"))) {
                    match = true;
                    break;
                }
            }
            if (!match) return false;
        }

        return true;
    }

    private void validateJobOwnership(Job job, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (user.getRole() == Role.ROLE_ADMIN) {
            return; // Admins can edit any job
        }

        if (job.getCompany().getUser() == null || !job.getCompany().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to modify job postings for another company.");
        }
    }

    private JobResponse mapToResponse(Job job) {
        JobResponse res = new JobResponse();
        res.setId(job.getId());
        res.setCompanyId(job.getCompany().getId());
        res.setCompanyName(job.getCompany().getCompanyName());
        res.setTitle(job.getTitle());
        res.setStream(job.getStream());
        res.setJobType(job.getJobType());
        res.setMinCgpa(job.getMinCgpa());
        res.setEligibleBranches(job.getEligibleBranches());
        res.setLocation(job.getLocation());
        res.setSalaryPackage(job.getSalaryPackage());
        res.setDescription(job.getDescription());
        res.setRequiredSkills(job.getRequiredSkills());
        res.setApplicationDeadline(job.getApplicationDeadline());
        res.setStatus(job.getStatus());
        res.setCreatedAt(job.getCreatedAt());
        return res;
    }
}
