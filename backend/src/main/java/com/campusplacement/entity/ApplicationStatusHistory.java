package com.campusplacement.entity;

import com.campusplacement.enums.ApplicationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_status_history")
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 40)
    private ApplicationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 40)
    private ApplicationStatus newStatus;

    @Column(name = "changed_by", nullable = false, length = 120)
    private String changedBy;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    public ApplicationStatusHistory() {}

    public ApplicationStatusHistory(Application application, ApplicationStatus previousStatus, ApplicationStatus newStatus, String changedBy, String comments) {
        this.application = application;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.comments = comments;
        this.changedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public ApplicationStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(ApplicationStatus previousStatus) { this.previousStatus = previousStatus; }

    public ApplicationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ApplicationStatus newStatus) { this.newStatus = newStatus; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
