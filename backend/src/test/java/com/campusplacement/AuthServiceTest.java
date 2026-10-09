package com.campusplacement;

import com.campusplacement.dto.RegisterStudentRequest;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
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

    private JwtTokenProvider tokenProvider;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                86400000L
        );
        authService = new AuthServiceImpl(
                authenticationManager,
                userRepository,
                studentProfileRepository,
                companyRepository,
                passwordEncoder,
                tokenProvider
        );
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
