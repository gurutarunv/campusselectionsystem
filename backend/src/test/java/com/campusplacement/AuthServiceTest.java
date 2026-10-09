package com.campusplacement;

import com.campusplacement.dto.AuthRequest;
import com.campusplacement.dto.AuthResponse;
import com.campusplacement.dto.RegisterStudentRequest;
import com.campusplacement.entity.StudentProfile;
import com.campusplacement.entity.User;
import com.campusplacement.enums.Role;
import com.campusplacement.exception.DuplicateResourceException;
import com.campusplacement.repository.CompanyRepository;
import com.campusplacement.repository.StudentProfileRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.security.JwtTokenProvider;
import com.campusplacement.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("student@campus.edu", "encodedPassword", Role.ROLE_STUDENT);
        sampleUser.setId(1L);
    }

    @Test
    void registerStudent_DuplicateEmail_ThrowsDuplicateResourceException() {
        RegisterStudentRequest request = new RegisterStudentRequest();
        request.setEmail("student@campus.edu");
        request.setPassword("password123");
        request.setFullName("Test Student");
        request.setPhone("1234567890");
        request.setGender("male");

        when(userRepository.existsByEmail("student@campus.edu")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.registerStudent(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
