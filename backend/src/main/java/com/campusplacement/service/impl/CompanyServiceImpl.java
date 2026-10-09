package com.campusplacement.service.impl;

import com.campusplacement.dto.CompanyResponse;
import com.campusplacement.entity.Company;
import com.campusplacement.entity.User;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.repository.CompanyRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllVerifiedCompanies() {
        return companyRepository.findByIsVerified(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return mapToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyByUserId(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found for user ID: " + userId));
        return mapToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return getCompanyByUserId(user.getId());
    }

    private CompanyResponse mapToResponse(Company company) {
        CompanyResponse res = new CompanyResponse();
        res.setId(company.getId());
        res.setUserId(company.getUser() != null ? company.getUser().getId() : null);
        res.setCompanyName(company.getCompanyName());
        res.setIndustry(company.getIndustry());
        res.setWebsite(company.getWebsite());
        res.setLocation(company.getLocation());
        res.setLogoUrl(company.getLogoUrl());
        res.setVerified(company.isVerified());
        res.setDescription(company.getDescription());
        res.setCreatedAt(company.getCreatedAt());
        return res;
    }
}
