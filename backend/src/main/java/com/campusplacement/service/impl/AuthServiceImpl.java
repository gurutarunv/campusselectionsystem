package com.campusplacement.service.impl;

import com.campusplacement.dto.AuthRequest;
import com.campusplacement.dto.AuthResponse;
import com.campusplacement.dto.RegisterCompanyRequest;
import com.campusplacement.dto.RegisterStudentRequest;
import com.campusplacement.entity.Company;
import com.campusplacement.entity.StudentProfile;
import com.campusplacement.entity.User;
import com.campusplacement.enums.Role;
import com.campusplacement.exception.DuplicateResourceException;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.repository.CompanyRepository;
import com.campusplacement.repository.StudentProfileRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.security.JwtTokenProvider;
import com.campusplacement.security.UserPrincipal;
import com.campusplacement.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           StudentProfileRepository studentProfileRepository,
                           CompanyRepository companyRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fullName = resolveFullName(user);

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                fullName
        );

        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), userInfo);
    }

    @Override
    @Transactional
    public AuthResponse registerStudent(RegisterStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists.");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_STUDENT
        );
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile(
                savedUser,
                request.getFullName(),
                request.getPhone(),
                request.getGender(),
                request.getCgpa(),
                request.getBranch(),
                request.getGraduationYear(),
                request.getSkillsJson()
        );
        studentProfileRepository.save(profile);

        return login(new AuthRequest(request.getEmail(), request.getPassword()));
    }

    @Override
    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists.");
        }
        if (companyRepository.existsByCompanyName(request.getCompanyName())) {
            throw new DuplicateResourceException("Company name " + request.getCompanyName() + " is already registered.");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_RECRUITER
        );
        User savedUser = userRepository.save(user);

        Company company = new Company(
                savedUser,
                request.getCompanyName(),
                request.getIndustry(),
                request.getWebsite(),
                request.getLocation(),
                true, // Auto-verified for seamless dev evaluation
                request.getDescription()
        );
        companyRepository.save(company);

        return login(new AuthRequest(request.getEmail(), request.getPassword()));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse.UserInfo getCurrentUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                resolveFullName(user)
        );
    }

    private String resolveFullName(User user) {
        if (user.getRole() == Role.ROLE_STUDENT) {
            return studentProfileRepository.findByUserId(user.getId())
                    .map(StudentProfile::getFullName)
                    .orElse(user.getEmail());
        } else if (user.getRole() == Role.ROLE_RECRUITER) {
            return companyRepository.findByUserId(user.getId())
                    .map(Company::getCompanyName)
                    .orElse(user.getEmail());
        }
        return "Placement Officer";
    }
}
