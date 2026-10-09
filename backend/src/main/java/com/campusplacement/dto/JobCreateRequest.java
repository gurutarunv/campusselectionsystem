package com.campusplacement.dto;

import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.JobType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class JobCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Stream is required")
    private JobStream stream;

    private JobType jobType = JobType.FULL_TIME;

    @DecimalMin(value = "0.0")
    private BigDecimal minCgpa = BigDecimal.valueOf(7.0);

    private String eligibleBranches = "ALL";

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Salary package is required")
    private String salaryPackage;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Required skills is required")
    private String requiredSkills;

    private LocalDate applicationDeadline;

    public JobCreateRequest() {}

    // Getters and Setters
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
}
