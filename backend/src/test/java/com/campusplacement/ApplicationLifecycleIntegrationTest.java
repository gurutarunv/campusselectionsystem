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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class ApplicationLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFullRecruitmentLifecycle() throws Exception {
        // 1. Student Login
        String studentLogin = "{\"email\":\"ananya.s@campus.edu\",\"password\":\"Student@123\"}";
        MvcResult studentAuth = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentLogin))
                .andExpect(status().isOk())
                .andReturn();

        String studentToken = extractToken(studentAuth);

        // 2. Student Applies for Job #1 (Google SDE)
        String appPayload = "{\"coverNote\":\"Passionate about cloud architecture and distributed systems.\"}";
        MvcResult applyResult = mockMvc.perform(post("/api/v1/applications/jobs/1")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPLIED"))
                .andReturn();

        JsonNode appJson = objectMapper.readTree(applyResult.getResponse().getContentAsString());
        long applicationId = appJson.path("data").path("id").asLong();

        // 3. Recruiter Login
        String recruiterLogin = "{\"email\":\"recruiter@google.com\",\"password\":\"Recruiter@123\"}";
        MvcResult recruiterAuth = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recruiterLogin))
                .andExpect(status().isOk())
                .andReturn();

        String recruiterToken = extractToken(recruiterAuth);

        // 4. Recruiter updates status to SHORTLISTED
        mockMvc.perform(patch("/api/v1/applications/" + applicationId + "/status?status=SHORTLISTED&comments=Approved+for+interviews")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SHORTLISTED"));

        // 5. Student checks application history and sees SHORTLISTED status
        mockMvc.perform(get("/api/v1/students/me/applications")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    private String extractToken(MvcResult result) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = root.path("data").path("token").asText();
        assertNotNull(token);
        return token;
    }
}
