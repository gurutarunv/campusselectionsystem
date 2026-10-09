package com.campusplacement.service.impl;

import com.campusplacement.dto.InterviewResponse;
import com.campusplacement.dto.InterviewScheduleRequest;
import com.campusplacement.entity.Application;
import com.campusplacement.entity.Interview;
import com.campusplacement.entity.User;
import com.campusplacement.enums.ApplicationStatus;
import com.campusplacement.enums.InterviewStatus;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.repository.ApplicationRepository;
import com.campusplacement.repository.InterviewRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.service.ApplicationService;
import com.campusplacement.service.InterviewService;
import com.campusplacement.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ApplicationService applicationService;
    private final NotificationService notificationService;

    public InterviewServiceImpl(InterviewRepository interviewRepository,
                                ApplicationRepository applicationRepository,
                                UserRepository userRepository,
                                ApplicationService applicationService,
                                NotificationService notificationService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.applicationService = applicationService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(String recruiterEmail, InterviewScheduleRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + request.getApplicationId()));

        Interview interview = interviewRepository.findByApplicationId(application.getId())
                .orElseGet(() -> new Interview(application, request.getInterviewDate(), request.getInterviewType(), request.getLocationOrLink()));

        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewType(request.getInterviewType());
        interview.setLocationOrLink(request.getLocationOrLink());
        interview.setStatus(InterviewStatus.SCHEDULED);
        if (request.getFeedbackNotes() != null) {
            interview.setFeedbackNotes(request.getFeedbackNotes());
        }

        Interview saved = interviewRepository.save(interview);

        // Advance Application Status to INTERVIEW_SCHEDULED
        applicationService.updateApplicationStatus(
                application.getId(),
                recruiterEmail,
                ApplicationStatus.INTERVIEW_SCHEDULED,
                "Interview scheduled: " + request.getInterviewType().name() + " at " + request.getInterviewDate()
        );

        // Send Student Notification
        notificationService.sendNotification(
                application.getStudentProfile().getUser().getId(),
                "Interview Scheduled: " + application.getJob().getCompany().getCompanyName(),
                "Your " + request.getInterviewType().name().replace('_', ' ') + " is scheduled for " + request.getInterviewDate() + ". Location/Link: " + request.getLocationOrLink(),
                "INTERVIEW_ALERT"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByStudent(String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentEmail));

        return interviewRepository.findByStudentUserIdAndStatus(user.getId(), InterviewStatus.SCHEDULED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByRecruiter(String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        return interviewRepository.findByRecruiterUserId(recruiter.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InterviewResponse updateInterviewFeedback(Long interviewId, String feedbackNotes) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        interview.setFeedbackNotes(feedbackNotes);
        interview.setStatus(InterviewStatus.COMPLETED);
        Interview updated = interviewRepository.save(interview);
        return mapToResponse(updated);
    }

    private InterviewResponse mapToResponse(Interview interview) {
        InterviewResponse res = new InterviewResponse();
        res.setId(interview.getId());
        res.setApplicationId(interview.getApplication().getId());
        res.setCandidateName(interview.getApplication().getStudentProfile().getFullName());
        res.setCandidateEmail(interview.getApplication().getStudentProfile().getUser().getEmail());
        res.setCompanyName(interview.getApplication().getJob().getCompany().getCompanyName());
        res.setJobTitle(interview.getApplication().getJob().getTitle());
        res.setInterviewDate(interview.getInterviewDate());
        res.setInterviewType(interview.getInterviewType());
        res.setLocationOrLink(interview.getLocationOrLink());
        res.setStatus(interview.getStatus());
        res.setFeedbackNotes(interview.getFeedbackNotes());
        res.setCreatedAt(interview.getCreatedAt());
        return res;
    }
}
