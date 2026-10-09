package com.campusplacement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies", indexes = {
    @Index(name = "idx_company_name", columnList = "company_name"),
    @Index(name = "idx_company_verified", columnList = "is_verified")
})
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "company_name", nullable = false, unique = true, length = 120)
    private String companyName;

    @Column(nullable = false, length = 100)
    private String industry;

    @Column(length = 255)
    private String website;

    @Column(nullable = false, length = 120)
    private String location;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Company() {}

    public Company(User user, String companyName, String industry, String website, String location, boolean isVerified, String description) {
        this.user = user;
        this.companyName = companyName;
        this.industry = industry;
        this.website = website;
        this.location = location;
        this.isVerified = isVerified;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
