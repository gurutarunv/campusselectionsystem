package com.campusplacement.repository;

import com.campusplacement.entity.Company;
import com.campusplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUser(User user);
    Optional<Company> findByUserId(Long userId);
    Optional<Company> findByCompanyName(String companyName);
    boolean existsByCompanyName(String companyName);
    List<Company> findByIsVerified(boolean isVerified);
    long countByIsVerified(boolean isVerified);
}
