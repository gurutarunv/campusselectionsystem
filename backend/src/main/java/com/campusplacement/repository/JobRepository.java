package com.campusplacement.repository;

import com.campusplacement.entity.Company;
import com.campusplacement.entity.Job;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = :status")
    List<Job> findByStatus(@Param("status") JobStatus status);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.stream = :stream AND j.status = :status")
    List<Job> findByStreamAndStatus(@Param("stream") JobStream stream, @Param("status") JobStatus status);

    List<Job> findByCompany(Company company);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.company.id = :companyId")
    List<Job> findByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = :status AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Job> searchJobs(@Param("status") JobStatus status, @Param("keyword") String keyword);

    long countByStatus(JobStatus status);
}
