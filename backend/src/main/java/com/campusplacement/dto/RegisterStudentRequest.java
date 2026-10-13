package com.campusplacement.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class RegisterStudentRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Min(value = 16, message = "Age must be at least 16")
    @Max(value = 99, message = "Age must be less than 100")
    private Integer age;

    @Pattern(regexp = "^$|^(\\+91[\\-\\s]?)?[6-9]\\d{9}$", message = "Please enter a valid 10-digit mobile number")
    private String phone;

    private String gender = "unspecified";

    @DecimalMin(value = "0.0", message = "CGPA cannot be negative")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.0")
    private BigDecimal cgpa;

    private String branch;

    @Min(value = 2020, message = "Invalid graduation year")
    @Max(value = 2035, message = "Invalid graduation year")
    private Integer graduationYear;

    private String skillsJson;

    public RegisterStudentRequest() {}

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = (gender != null && !gender.isBlank()) ? gender : "unspecified"; }

    public BigDecimal getCgpa() { return cgpa; }
    public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getSkillsJson() { return skillsJson; }
    public void setSkillsJson(String skillsJson) { this.skillsJson = skillsJson; }
}
