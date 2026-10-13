package com.campusplacement.service.impl;

import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.dto.StoredFile;
import com.campusplacement.dto.StudentProfileRequest;
import com.campusplacement.dto.StudentProfileResponse;
import com.campusplacement.entity.Application;
import com.campusplacement.entity.StudentProfile;
import com.campusplacement.entity.User;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.repository.ApplicationRepository;
import com.campusplacement.repository.StudentProfileRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.service.FileStorageService;
import com.campusplacement.service.StudentService;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;

    public StudentServiceImpl(StudentProfileRepository studentProfileRepository,
                              UserRepository userRepository,
                              ApplicationRepository applicationRepository,
                              FileStorageService fileStorageService) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileByEmail(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));
        return mapToResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public StudentProfileResponse updateProfile(String email, StudentProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> new StudentProfile(user, request.getFullName(), request.getPhone(), request.getGender(), request.getCgpa(), request.getBranch(), request.getGraduationYear(), request.getSkillsJson()));

        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setGender(request.getGender());
        profile.setCgpa(request.getCgpa());
        profile.setBranch(request.getBranch());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setSkillsJson(request.getSkillsJson());
        if (request.getResumeUrl() != null && !request.getResumeUrl().isBlank()) {
            profile.setResumeUrl(request.getResumeUrl());
        }

        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Application> applications = applicationRepository.findByUserIdWithDetails(user.getId());
        return applications.stream().map(this::mapToAppResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudentProfileResponse uploadResume(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email));

        // Delete existing file if present
        if (profile.getResumeStorageName() != null) {
            fileStorageService.deleteFile(profile.getResumeStorageName());
        }

        StoredFile storedFile = fileStorageService.storePdf(file);
        profile.setResumeFileName(storedFile.getOriginalFileName());
        profile.setResumeStorageName(storedFile.getStorageFileName());
        profile.setResumeFileSize(storedFile.getFileSize());
        profile.setResumeContentType(storedFile.getContentType());
        profile.setResumeUploadedAt(LocalDateTime.now());
        profile.setResumeUrl("/api/v1/students/resume/download");

        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getResumeResource(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));

        if (profile.getResumeStorageName() == null) {
            throw new ResourceNotFoundException("No PDF resume uploaded yet for this account.");
        }

        return fileStorageService.loadAsResource(profile.getResumeStorageName());
    }

    @Override
    @Transactional(readOnly = true)
    public String getResumeOriginalFileName(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));
        return profile.getResumeFileName() != null ? profile.getResumeFileName() : "resume.pdf";
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getResumeResourceByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user ID: " + userId));

        if (profile.getResumeStorageName() == null) {
            throw new ResourceNotFoundException("No PDF resume uploaded yet for candidate ID: " + userId);
        }

        return fileStorageService.loadAsResource(profile.getResumeStorageName());
    }

    @Override
    @Transactional(readOnly = true)
    public String getResumeOriginalFileNameByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user ID: " + userId));
        return profile.getResumeFileName() != null ? profile.getResumeFileName() : "candidate_resume.pdf";
    }

    @Override
    @Transactional
    public void deleteResume(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));

        if (profile.getResumeStorageName() != null) {
            fileStorageService.deleteFile(profile.getResumeStorageName());
            profile.setResumeStorageName(null);
            profile.setResumeFileName(null);
            profile.setResumeFileSize(null);
            profile.setResumeContentType(null);
            profile.setResumeUploadedAt(null);
            profile.setResumeUrl(null);
            studentProfileRepository.save(profile);
        }
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        StudentProfileResponse res = new StudentProfileResponse();
        res.setId(profile.getId());
        res.setUserId(profile.getUser().getId());
        res.setEmail(profile.getUser().getEmail());
        res.setFullName(profile.getFullName());
        res.setPhone(profile.getPhone());
        res.setGender(profile.getGender());
        res.setCgpa(profile.getCgpa());
        res.setBranch(profile.getBranch());
        res.setGraduationYear(profile.getGraduationYear());
        
        // If storage name exists, configure download endpoint
        if (profile.getResumeStorageName() != null) {
            res.setResumeUrl("/api/v1/students/resume/download");
        } else {
            res.setResumeUrl(profile.getResumeUrl());
        }

        res.setResumeFileName(profile.getResumeFileName());
        res.setResumeFileSize(profile.getResumeFileSize());
        res.setResumeContentType(profile.getResumeContentType());
        res.setResumeUploadedAt(profile.getResumeUploadedAt());
        res.setSkillsJson(profile.getSkillsJson());
        res.setCreatedAt(profile.getCreatedAt());
        return res;
    }

    private ApplicationResponse mapToAppResponse(Application app) {
        ApplicationResponse res = new ApplicationResponse();
        res.setId(app.getId());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setCompanyName(app.getJob().getCompany().getCompanyName());
        res.setStream(app.getJob().getStream());
        res.setSalaryPackage(app.getJob().getSalaryPackage());
        res.setStudentProfileId(app.getStudentProfile().getId());
        res.setStudentUserId(app.getStudentProfile().getUser().getId());
        res.setStudentName(app.getStudentProfile().getFullName());
        res.setStudentEmail(app.getStudentProfile().getUser().getEmail());
        res.setStudentPhone(app.getStudentProfile().getPhone());
        res.setStudentBranch(app.getStudentProfile().getBranch());
        res.setStudentCgpa(app.getStudentProfile().getCgpa());
        res.setStatus(app.getStatus());
        res.setCoverNote(app.getCoverNote());
        res.setAppliedAt(app.getAppliedAt());
        return res;
    }
}
