package com.campusplacement;

import com.campusplacement.dto.ApplicationRequest;
import com.campusplacement.dto.ApplicationResponse;
import com.campusplacement.entity.*;
import com.campusplacement.enums.*;
import com.campusplacement.exception.DuplicateResourceException;
import com.campusplacement.repository.*;
import com.campusplacement.service.JobService;
import com.campusplacement.service.NotificationService;
import com.campusplacement.service.impl.ApplicationServiceImpl;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStatusHistoryRepository historyRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobService jobService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private StudentProfile student;
    private Job job;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User("student@campus.edu", "pass", Role.ROLE_STUDENT);
        user.setId(1L);

        student = new StudentProfile(user, "Guru Prasad", "12345", "male", BigDecimal.valueOf(8.8), "CS", 2026, "Java");
        student.setId(1L);

        Company company = new Company(null, "Google", "Tech", "web", "Hyd", true, "desc");
        company.setId(1L);

        job = new Job(company, "SDE", JobStream.IT, JobType.FULL_TIME, BigDecimal.valueOf(7.0), "CS", "Hyd", "20 LPA", "desc", "Java", LocalDate.now().plusDays(30));
        job.setId(5L);
        job.setStatus(JobStatus.ACTIVE);
    }

    @Test
    void applyForJob_DuplicateApplication_ThrowsDuplicateResourceException() {
        when(studentProfileRepository.findByUserEmail("student@campus.edu")).thenReturn(Optional.of(student));
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByStudentProfileIdAndJobId(1L, 5L)).thenReturn(true);

        ApplicationRequest req = new ApplicationRequest("Cover note");

        assertThrows(DuplicateResourceException.class, () ->
                applicationService.applyForJob("student@campus.edu", 5L, req)
        );

        verify(applicationRepository, never()).save(any(Application.class));
    }
}
