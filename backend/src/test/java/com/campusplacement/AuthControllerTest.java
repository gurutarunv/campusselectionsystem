package com.campusplacement;

import com.campusplacement.controller.AuthController;
import com.campusplacement.dto.AuthRequest;
import com.campusplacement.dto.AuthResponse;
import com.campusplacement.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void login_ValidCredentials_Returns200WithJwtToken() throws Exception {
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                1L,
                "admin@campus.edu",
                "ROLE_ADMIN",
                "Dean of Placements"
        );
        AuthResponse authResponse = new AuthResponse("mock-jwt-token", 86400000L, userInfo);

        when(authService.login(any(AuthRequest.class))).thenReturn(authResponse);

        String jsonPayload = "{\"email\":\"admin@campus.edu\",\"password\":\"Admin@123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.data.user.email").value("admin@campus.edu"))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_ADMIN"));
    }
}
