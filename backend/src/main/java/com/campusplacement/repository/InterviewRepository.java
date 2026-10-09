package com.campusplacement.repository;

import com.campusplacement.entity.Interview;
import com.campusplacement.enums.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Optional<Interview> findByApplicationId(Long applicationId);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.studentProfile s JOIN FETCH a.job j WHERE s.user.id = :studentUserId AND i.status = :status")
    List<Interview> findByStudentUserIdAndStatus(@Param("studentUserId") Long studentUserId, @Param("status") InterviewStatus status);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.studentProfile s JOIN FETCH a.job j WHERE j.company.user.id = :recruiterUserId")
    List<Interview> findByRecruiterUserId(@Param("recruiterUserId") Long recruiterUserId);

    List<Interview> findByInterviewDateAfter(LocalDateTime date);
}
