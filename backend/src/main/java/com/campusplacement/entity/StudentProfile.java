package com.campusplacement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles", indexes = {
    @Index(name = "idx_student_branch_cgpa", columnList = "branch, cgpa"),
    @Index(name = "idx_student_grad_year", columnList = "graduation_year")
})
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 25)
    private String phone;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal cgpa;

    @Column(nullable = false, length = 100)
    private String branch;

    @Column(name = "graduation_year", nullable = false)
    private Integer graduationYear;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "skills_json", columnDefinition = "TEXT")
    private String skillsJson; // e.g. "Java, Spring Boot, React, MySQL"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StudentProfile() {}

    public StudentProfile(User user, String fullName, String phone, String gender, BigDecimal cgpa, String branch, Integer graduationYear, String skillsJson) {
        this.user = user;
        this.fullName = fullName;
        this.phone = phone;
        this.gender = gender;
        this.cgpa = cgpa;
        this.branch = branch;
        this.graduationYear = graduationYear;
        this.skillsJson = skillsJson;
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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public BigDecimal getCgpa() { return cgpa; }
    public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getSkillsJson() { return skillsJson; }
    public void setSkillsJson(String skillsJson) { this.skillsJson = skillsJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
