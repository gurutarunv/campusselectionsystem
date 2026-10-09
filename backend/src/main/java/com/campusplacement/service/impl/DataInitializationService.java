package com.campusplacement.service.impl;

import com.campusplacement.entity.*;
import com.campusplacement.enums.*;
import com.campusplacement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DataInitializationService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializationService(UserRepository userRepository,
                                     StudentProfileRepository studentProfileRepository,
                                     CompanyRepository companyRepository,
                                     JobRepository jobRepository,
                                     ApplicationRepository applicationRepository,
                                     InterviewRepository interviewRepository,
                                     NotificationRepository notificationRepository,
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Create Placement Admin
        User admin = new User("admin@campus.edu", passwordEncoder.encode("Admin@123"), Role.ROLE_ADMIN);
        userRepository.save(admin);

        // 2. Create Corporate Recruiters
        User recruiterGoogle = new User("recruiter@google.com", passwordEncoder.encode("Recruiter@123"), Role.ROLE_RECRUITER);
        userRepository.save(recruiterGoogle);

        User recruiterAmazon = new User("recruiter@amazon.com", passwordEncoder.encode("Recruiter@123"), Role.ROLE_RECRUITER);
        userRepository.save(recruiterAmazon);

        // 3. Create Students
        User student1 = new User("student@campus.edu", passwordEncoder.encode("Student@123"), Role.ROLE_STUDENT);
        userRepository.save(student1);

        User student2 = new User("ananya.s@campus.edu", passwordEncoder.encode("Student@123"), Role.ROLE_STUDENT);
        userRepository.save(student2);

        // 4. Create Student Profiles
        StudentProfile profile1 = new StudentProfile(
                student1,
                "Guru Prasad",
                "+91 9876543210",
                "male",
                BigDecimal.valueOf(8.85),
                "Computer Science & Engineering",
                2026,
                "Java, Spring Boot, React, MySQL, Data Structures, Docker"
        );
        profile1.setResumeUrl("https://drive.google.com/file/demo-resume/view");
        studentProfileRepository.save(profile1);

        StudentProfile profile2 = new StudentProfile(
                student2,
                "Ananya Sharma",
                "+91 9812345678",
                "female",
                BigDecimal.valueOf(9.15),
                "Information Technology",
                2026,
                "Java, Python, Cloud Computing, React, Microservices"
        );
        studentProfileRepository.save(profile2);

        // 5. Create Verified Companies
        Company google = new Company(
                recruiterGoogle,
                "Google LLC",
                "Cloud & Internet Technologies",
                "https://careers.google.com",
                "Bengaluru / Hyderabad",
                true,
                "Global technology leader in search, cloud infrastructure, AI, and developer tools."
        );
        companyRepository.save(google);

        Company amazon = new Company(
                recruiterAmazon,
                "Amazon AWS",
                "Cloud Infrastructure & E-Commerce",
                "https://amazon.jobs",
                "Hyderabad / Chennai",
                true,
                "World leader in cloud computing platforms, high-scale logistics, and enterprise services."
        );
        companyRepository.save(amazon);

        Company mayo = new Company(
                null,
                "Mayo Clinic Health",
                "Healthcare & Clinical Research",
                "https://mayoclinic.org",
                "Mumbai / Delhi",
                true,
                "Premier non-profit academic medical center focused on clinical trials and healthcare informatics."
        );
        companyRepository.save(mayo);

        // 6. Create Job Postings
        Job job1 = new Job(
                google,
                "Software Development Engineer - Cloud & Infrastructure",
                JobStream.IT,
                JobType.FULL_TIME,
                BigDecimal.valueOf(8.0),
                "CS, IT, ECE",
                "Hyderabad / Bengaluru",
                "₹24 - 32 LPA",
                "Design and deploy scalable distributed microservices, cloud infrastructure components, and performant backend APIs.",
                "Java, C++, Distributed Systems, Data Structures, Spring Boot",
                LocalDate.now().plusMonths(2)
        );
        jobRepository.save(job1);

        Job job2 = new Job(
                amazon,
                "Cloud Support & Backend Systems Engineer",
                JobStream.IT,
                JobType.FULL_TIME,
                BigDecimal.valueOf(7.5),
                "CS, IT, ECE, EE",
                "Hyderabad / Chennai",
                "₹18 - 26 LPA",
                "Build enterprise-grade cloud telemetry tools, AWS Lambda serverless functions, and Java API services.",
                "Java, Python, AWS, Linux, Networking, SQL",
                LocalDate.now().plusMonths(3)
        );
        jobRepository.save(job2);

        Job job3 = new Job(
                mayo,
                "Clinical Research & Healthcare Coordinator",
                JobStream.NON_IT,
                JobType.FULL_TIME,
                BigDecimal.valueOf(6.5),
                "Bio-Technology, Life Sciences, Pharmacy",
                "Mumbai / Delhi",
                "₹8 - 14 LPA",
                "Coordinate clinical trials, manage regulatory compliance, and liaise with healthcare investigators.",
                "Clinical Data Management, GCP Compliance, Life Sciences Degree",
                LocalDate.now().plusMonths(2)
        );
        jobRepository.save(job3);

        // 7. Create Sample Applications & Interviews
        Application app1 = new Application(profile1, job1, "Specialized in Java 21, Spring Boot, and cloud architecture.");
        app1.setStatus(ApplicationStatus.SHORTLISTED);
        applicationRepository.save(app1);

        Interview interview1 = new Interview(
                app1,
                LocalDateTime.now().plusDays(2).withHour(10).withMinute(30),
                InterviewType.TECHNICAL_ROUND,
                "https://meet.google.com/cpa-demo-inte"
        );
        interviewRepository.save(interview1);

        Notification notif = new Notification(
                student1,
                "Interview Scheduled by Google",
                "You have been shortlisted for Round 1 Technical Interview for Software Development Engineer position.",
                "INTERVIEW_ALERT"
        );
        notificationRepository.save(notif);
    }
}
