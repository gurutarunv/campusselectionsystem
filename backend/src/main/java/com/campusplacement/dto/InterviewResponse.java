package com.campusplacement.dto;

import com.campusplacement.enums.InterviewStatus;
import com.campusplacement.enums.InterviewType;
import java.time.LocalDateTime;

public class InterviewResponse {
    private Long id;
    private Long applicationId;
    private String candidateName;
    private String candidateEmail;
    private String companyName;
    private String jobTitle;
    private LocalDateTime interviewDate;
    private InterviewType interviewType;
    private String locationOrLink;
    private InterviewStatus status;
    private String feedbackNotes;
    private LocalDateTime createdAt;

    public InterviewResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }

    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }

    public String getLocationOrLink() { return locationOrLink; }
    public void setLocationOrLink(String locationOrLink) { this.locationOrLink = locationOrLink; }

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public String getFeedbackNotes() { return feedbackNotes; }
    public void setFeedbackNotes(String feedbackNotes) { this.feedbackNotes = feedbackNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
