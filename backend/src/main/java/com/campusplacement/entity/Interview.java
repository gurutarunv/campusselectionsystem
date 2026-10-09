package com.campusplacement.entity;

import com.campusplacement.enums.InterviewStatus;
import com.campusplacement.enums.InterviewType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_date", columnList = "interview_date")
})
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(name = "interview_date", nullable = false)
    private LocalDateTime interviewDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false, length = 50)
    private InterviewType interviewType;

    @Column(name = "location_or_link", nullable = false, length = 300)
    private String locationOrLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(name = "feedback_notes", columnDefinition = "TEXT")
    private String feedbackNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Interview() {}

    public Interview(Application application, LocalDateTime interviewDate, InterviewType interviewType, String locationOrLink) {
        this.application = application;
        this.interviewDate = interviewDate;
        this.interviewType = interviewType;
        this.locationOrLink = locationOrLink;
        this.status = InterviewStatus.SCHEDULED;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

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
