package com.campusplacement.service;

import com.campusplacement.dto.CompanyResponse;
import java.util.List;

public interface CompanyService {
    List<CompanyResponse> getAllVerifiedCompanies();
    CompanyResponse getCompanyById(Long id);
    CompanyResponse getCompanyByUserId(Long userId);
    CompanyResponse getCompanyByEmail(String email);
}
