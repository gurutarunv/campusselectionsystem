package com.campusplacement;

import com.campusplacement.entity.Company;
import com.campusplacement.entity.Job;
import com.campusplacement.entity.StudentProfile;
import com.campusplacement.entity.User;
import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.JobType;
import com.campusplacement.enums.Role;
import com.campusplacement.repository.CompanyRepository;
import com.campusplacement.repository.JobRepository;
import com.campusplacement.repository.StudentProfileRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.service.impl.JobServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobEligibilityServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private JobServiceImpl jobService;

    private StudentProfile highCgpaStudent;
    private StudentProfile lowCgpaStudent;
    private Job techJob;

    @BeforeEach
    void setUp() {
        User user1 = new User("high@campus.edu", "pass", Role.ROLE_STUDENT);
        user1.setId(1L);
        highCgpaStudent = new StudentProfile(user1, "High Student", "12345", "male", BigDecimal.valueOf(8.5), "Computer Science", 2026, "Java");
        highCgpaStudent.setId(1L);

        User user2 = new User("low@campus.edu", "pass", Role.ROLE_STUDENT);
        user2.setId(2L);
        lowCgpaStudent = new StudentProfile(user2, "Low Student", "12345", "female", BigDecimal.valueOf(6.2), "Mechanical", 2026, "CAD");
        lowCgpaStudent.setId(2L);

        Company company = new Company(null, "Google", "Tech", "web", "Hyd", true, "desc");
        company.setId(1L);

        techJob = new Job(company, "SDE", JobStream.IT, JobType.FULL_TIME, BigDecimal.valueOf(7.5), "CS, IT", "Hyd", "20 LPA", "desc", "Java", LocalDate.now().plusDays(30));
        techJob.setId(10L);
    }

    @Test
    void checkEligibility_EligibleStudent_ReturnsTrue() {
        when(studentProfileRepository.findById(1L)).thenReturn(Optional.of(highCgpaStudent));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(techJob));

        boolean eligible = jobService.checkEligibility(1L, 10L);
        assertTrue(eligible, "Student with 8.5 CGPA and CS branch should be eligible for 7.5 CGPA CS job");
    }

    @Test
    void checkEligibility_LowCgpaStudent_ReturnsFalse() {
        when(studentProfileRepository.findById(2L)).thenReturn(Optional.of(lowCgpaStudent));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(techJob));

        boolean eligible = jobService.checkEligibility(2L, 10L);
        assertFalse(eligible, "Student with 6.2 CGPA should not be eligible for 7.5 CGPA job");
    }
}
