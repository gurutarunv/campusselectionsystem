package com.campusplacement.entity;

import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.JobType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_stream_status", columnList = "stream, status"),
    @Index(name = "idx_jobs_deadline", columnList = "application_deadline")
})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JobStream stream;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 30)
    private JobType jobType = JobType.FULL_TIME;

    @Column(name = "min_cgpa", nullable = false, precision = 4, scale = 2)
    private BigDecimal minCgpa;

    @Column(name = "eligible_branches", nullable = false, length = 255)
    private String eligibleBranches = "ALL";

    @Column(nullable = false, length = 120)
    private String location;

    @Column(name = "salary_package", nullable = false, length = 100)
    private String salaryPackage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "required_skills", nullable = false, columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JobStatus status = JobStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Job() {}

    public Job(Company company, String title, JobStream stream, JobType jobType, BigDecimal minCgpa, String eligibleBranches, String location, String salaryPackage, String description, String requiredSkills, LocalDate applicationDeadline) {
        this.company = company;
        this.title = title;
        this.stream = stream;
        this.jobType = jobType;
        this.minCgpa = minCgpa;
        this.eligibleBranches = eligibleBranches;
        this.location = location;
        this.salaryPackage = salaryPackage;
        this.description = description;
        this.requiredSkills = requiredSkills;
        this.applicationDeadline = applicationDeadline;
        this.status = JobStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public JobStream getStream() { return stream; }
    public void setStream(JobStream stream) { this.stream = stream; }

    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }

    public BigDecimal getMinCgpa() { return minCgpa; }
    public void setMinCgpa(BigDecimal minCgpa) { this.minCgpa = minCgpa; }

    public String getEligibleBranches() { return eligibleBranches; }
    public void setEligibleBranches(String eligibleBranches) { this.eligibleBranches = eligibleBranches; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalaryPackage() { return salaryPackage; }
    public void setSalaryPackage(String salaryPackage) { this.salaryPackage = salaryPackage; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
