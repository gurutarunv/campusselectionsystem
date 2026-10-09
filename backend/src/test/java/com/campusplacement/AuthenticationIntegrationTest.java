package com.campusplacement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLogin_Success_AdminRole() throws Exception {
        String payload = "{\"email\":\"admin@campus.edu\",\"password\":\"Admin@123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("admin@campus.edu"))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_ADMIN"));
    }

    @Test
    void testLogin_InvalidPassword_Returns401Unauthorized() throws Exception {
        String payload = "{\"email\":\"admin@campus.edu\",\"password\":\"WrongPassword!\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogin_NonExistentUser_Returns401Unauthorized() throws Exception {
        String payload = "{\"email\":\"unknown.user@campus.edu\",\"password\":\"Password@123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRegisterStudent_Success() throws Exception {
        String uniqueEmail = "test.student." + System.currentTimeMillis() + "@campus.edu";
        String payload = "{" +
                "\"email\":\"" + uniqueEmail + "\"," +
                "\"password\":\"Student@123\"," +
                "\"fullName\":\"Integration Test Student\"," +
                "\"phone\":\"+91 9988776655\"," +
                "\"gender\":\"male\"," +
                "\"branch\":\"Computer Science\"," +
                "\"cgpa\":8.5," +
                "\"graduationYear\":2026," +
                "\"skillsJson\":\"Java, Spring Boot\"" +
                "}";

        mockMvc.perform(post("/api/v1/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(uniqueEmail))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_STUDENT"));
    }

    @Test
    void testAdminEndpoint_WithoutToken_ReturnsForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminEndpoint_WithStudentToken_Returns403Forbidden() throws Exception {
        // 1. Authenticate as student
        String studentLogin = "{\"email\":\"student@campus.edu\",\"password\":\"Student@123\"}";
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentLogin))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        String studentToken = responseJson.path("data").path("token").asText();
        assertNotNull(studentToken);

        // 2. Attempt to access Admin dashboard with student token
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminEndpoint_WithAdminToken_Returns200Ok() throws Exception {
        // 1. Authenticate as admin
        String adminLogin = "{\"email\":\"admin@campus.edu\",\"password\":\"Admin@123\"}";
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(adminLogin))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        String adminToken = responseJson.path("data").path("token").asText();
        assertNotNull(adminToken);

        // 2. Access Admin dashboard with admin token
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalStudents").isNumber());
    }
}
