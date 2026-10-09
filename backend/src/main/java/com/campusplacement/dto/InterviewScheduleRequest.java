package com.campusplacement.dto;

import com.campusplacement.enums.InterviewType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class InterviewScheduleRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Interview date is required")
    private LocalDateTime interviewDate;

    @NotNull(message = "Interview round type is required")
    private InterviewType interviewType = InterviewType.TECHNICAL_ROUND;

    @NotBlank(message = "Meeting link or campus location is required")
    private String locationOrLink;

    private String feedbackNotes;

    public InterviewScheduleRequest() {}

    // Getters and Setters
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }

    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }

    public String getLocationOrLink() { return locationOrLink; }
    public void setLocationOrLink(String locationOrLink) { this.locationOrLink = locationOrLink; }

    public String getFeedbackNotes() { return feedbackNotes; }
    public void setFeedbackNotes(String feedbackNotes) { this.feedbackNotes = feedbackNotes; }
}
