package com.campusplacement.service.impl;

import com.campusplacement.dto.ApplicationRequest;
import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.entity.*;
import com.campusplacement.enums.ApplicationStatus;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.Role;
import com.campusplacement.exception.BadRequestException;
import com.campusplacement.exception.DuplicateResourceException;
import com.campusplacement.exception.IneligibleApplicationException;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.exception.UnauthorizedException;
import com.campusplacement.repository.*;
import com.campusplacement.service.ApplicationService;
import com.campusplacement.service.JobService;
import com.campusplacement.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final JobRepository jobRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final JobService jobService;
    private final NotificationService notificationService;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository,
                                  ApplicationStatusHistoryRepository historyRepository,
                                  JobRepository jobRepository,
                                  StudentProfileRepository studentProfileRepository,
                                  UserRepository userRepository,
                                  JobService jobService,
                                  NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.jobRepository = jobRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.jobService = jobService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ApplicationResponse applyForJob(String studentEmail, Long jobId, ApplicationRequest request) {
        StudentProfile student = studentProfileRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + studentEmail));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening not found with id: " + jobId));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("This job posting is no longer active for applications.");
        }

        if (applicationRepository.existsByStudentProfileIdAndJobId(student.getId(), job.getId())) {
            throw new DuplicateResourceException("You have already submitted an application for " + job.getTitle() + " at " + job.getCompany().getCompanyName());
        }

        // Eligibility Check
        if (!jobService.checkEligibility(student.getId(), job.getId())) {
            throw new IneligibleApplicationException("Your academic profile (CGPA: " + student.getCgpa() + ", Branch: " + student.getBranch() + ") does not meet the criteria for this position (Min CGPA: " + job.getMinCgpa() + ", Branches: " + job.getEligibleBranches() + ")");
        }

        Application application = new Application(
                student,
                job,
                request != null ? request.getCoverNote() : null
        );

        Application savedApp = applicationRepository.save(application);

        // Record Initial History
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                savedApp,
                null,
                ApplicationStatus.APPLIED,
                studentEmail,
                "Application submitted by candidate"
        );
        historyRepository.save(history);

        // Notify Student
        notificationService.sendNotification(
                student.getUser().getId(),
                "Application Submitted",
                "Your application for " + job.getTitle() + " at " + job.getCompany().getCompanyName() + " was successfully received.",
                "APPLICATION_UPDATE"
        );

        return mapToResponse(savedApp);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String recruiterEmail, ApplicationStatus newStatus, String comments) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        if (recruiter.getRole() != Role.ROLE_ADMIN) {
            if (application.getJob().getCompany().getUser() == null || 
                !application.getJob().getCompany().getUser().getId().equals(recruiter.getId())) {
                throw new UnauthorizedException("You are not authorized to update applications for another company.");
            }
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(newStatus);
        Application updatedApp = applicationRepository.save(application);

        // Record History
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updatedApp,
                previousStatus,
                newStatus,
                recruiterEmail,
                comments != null ? comments : "Stage updated to " + newStatus.name()
        );
        historyRepository.save(history);

        // Notify Student of Status Update
        notificationService.sendNotification(
                application.getStudentProfile().getUser().getId(),
                "Application Status: " + newStatus.name().replace('_', ' '),
                "Your application for " + application.getJob().getTitle() + " at " + application.getJob().getCompany().getCompanyName() + " is now " + newStatus.name().replace('_', ' ') + ".",
                "APPLICATION_UPDATE"
        );

        return mapToResponse(updatedApp);
    }

    @Override
    @Transactional
    public ApplicationResponse withdrawApplication(Long applicationId, String studentEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!application.getStudentProfile().getUser().getEmail().equalsIgnoreCase(studentEmail)) {
            throw new UnauthorizedException("You can only withdraw your own applications.");
        }

        if (application.getStatus() == ApplicationStatus.SELECTED) {
            throw new BadRequestException("Cannot withdraw an application that has already been offered/selected.");
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                ApplicationStatus.WITHDRAWN,
                studentEmail,
                "Application voluntarily withdrawn by student"
        );
        historyRepository.save(history);

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByJob(Long jobId, String recruiterEmail) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByRecruiter(String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        return applicationRepository.findByRecruiterUserIdWithDetails(recruiter.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return mapToResponse(application);
    }

    private ApplicationResponse mapToResponse(Application app) {
        ApplicationResponse res = new ApplicationResponse();
        res.setId(app.getId());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setCompanyName(app.getJob().getCompany().getCompanyName());
        res.setStream(app.getJob().getStream());
        res.setSalaryPackage(app.getJob().getSalaryPackage());
        res.setStudentProfileId(app.getStudentProfile().getId());
        res.setStudentName(app.getStudentProfile().getFullName());
        res.setStudentEmail(app.getStudentProfile().getUser().getEmail());
        res.setStudentPhone(app.getStudentProfile().getPhone());
        res.setStudentBranch(app.getStudentProfile().getBranch());
        res.setStudentCgpa(app.getStudentProfile().getCgpa());
        res.setStatus(app.getStatus());
        res.setCoverNote(app.getCoverNote());
        res.setAppliedAt(app.getAppliedAt());
        return res;
    }
}
