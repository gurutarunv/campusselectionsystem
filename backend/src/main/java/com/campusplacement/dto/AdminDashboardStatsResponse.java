package com.campusplacement.dto;

public class AdminDashboardStatsResponse {
    private long totalStudents;
    private long placedStudents;
    private long activeCompanies;
    private long pendingCompanies;
    private long activeJobs;
    private long totalApplications;
    private String placementRate;

    public AdminDashboardStatsResponse() {}

    public AdminDashboardStatsResponse(long totalStudents, long placedStudents, long activeCompanies, long pendingCompanies, long activeJobs, long totalApplications, String placementRate) {
        this.totalStudents = totalStudents;
        this.placedStudents = placedStudents;
        this.activeCompanies = activeCompanies;
        this.pendingCompanies = pendingCompanies;
        this.activeJobs = activeJobs;
        this.totalApplications = totalApplications;
        this.placementRate = placementRate;
    }

    // Getters and Setters
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getPlacedStudents() { return placedStudents; }
    public void setPlacedStudents(long placedStudents) { this.placedStudents = placedStudents; }

    public long getActiveCompanies() { return activeCompanies; }
    public void setActiveCompanies(long activeCompanies) { this.activeCompanies = activeCompanies; }

    public long getPendingCompanies() { return pendingCompanies; }
    public void setPendingCompanies(long pendingCompanies) { this.pendingCompanies = pendingCompanies; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public String getPlacementRate() { return placementRate; }
    public void setPlacementRate(String placementRate) { this.placementRate = placementRate; }
}
