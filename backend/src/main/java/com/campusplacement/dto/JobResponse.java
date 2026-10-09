package com.campusplacement.dto;

import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.JobType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private String title;
    private JobStream stream;
    private JobType jobType;
    private BigDecimal minCgpa;
    private String eligibleBranches;
    private String location;
    private String salaryPackage;
    private String description;
    private String requiredSkills;
    private LocalDate applicationDeadline;
    private JobStatus status;
    private LocalDateTime createdAt;

    public JobResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

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
}
