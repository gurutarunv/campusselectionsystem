package com.campusplacement.repository;

import com.campusplacement.entity.Application;
import com.campusplacement.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByStudentProfileIdAndJobId(Long studentProfileId, Long jobId);

    List<Application> findByStudentProfileId(Long studentProfileId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByStatus(ApplicationStatus status);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.company JOIN FETCH a.studentProfile s WHERE s.user.id = :userId")
    List<Application> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH a.studentProfile s WHERE j.company.id = :companyId")
    List<Application> findByCompanyIdWithDetails(@Param("companyId") Long companyId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH a.studentProfile s WHERE j.company.user.id = :recruiterUserId")
    List<Application> findByRecruiterUserIdWithDetails(@Param("recruiterUserId") Long recruiterUserId);

    long countByStatus(ApplicationStatus status);
}
