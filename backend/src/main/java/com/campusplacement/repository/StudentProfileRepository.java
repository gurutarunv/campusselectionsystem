package com.campusplacement.repository;

import com.campusplacement.entity.StudentProfile;
import com.campusplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);
    
    List<StudentProfile> findByBranch(String branch);
    List<StudentProfile> findByCgpaGreaterThanEqual(BigDecimal minCgpa);

    @Query("SELECT s FROM StudentProfile s JOIN FETCH s.user WHERE s.user.email = :email")
    Optional<StudentProfile> findByUserEmail(String email);

    boolean existsByPhone(String phone);
    Optional<StudentProfile> findByPhone(String phone);
}
