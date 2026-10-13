package com.campusplacement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class StudentResumeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Helper to log in as student and get JWT token
    private String getStudentToken() throws Exception {
        String loginPayload = "{\"email\":\"student@campus.edu\",\"password\":\"Student@123\"}";
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.path("data").path("token").asText();
    }

    // Helper to log in as recruiter and get JWT token
    private String getRecruiterToken() throws Exception {
        String loginPayload = "{\"email\":\"recruiter@google.com\",\"password\":\"Recruiter@123\"}";
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.path("data").path("token").asText();
    }

    @Test
    void testUploadResume_ValidPdf_Success() throws Exception {
        String token = getStudentToken();

        // Valid PDF begins with %PDF (0x25, 0x50, 0x44, 0x46)
        byte[] validPdfBytes = "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF".getBytes();
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "test_resume.pdf",
                "application/pdf",
                validPdfBytes
        );

        mockMvc.perform(multipart("/api/v1/students/resume")
                        .file(pdfFile)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.resumeFileName").value("test_resume.pdf"))
                .andExpect(jsonPath("$.data.resumeFileSize").isNumber());
    }

    @Test
    void testUploadResume_NonPdfExtension_Returns400BadRequest() throws Exception {
        String token = getStudentToken();

        MockMultipartFile textFile = new MockMultipartFile(
                "file",
                "notes.txt",
                "text/plain",
                "Plain text resume".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/students/resume")
                        .file(textFile)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid File Type"));
    }

    @Test
    void testUploadResume_InvalidMagicBytes_Returns400BadRequest() throws Exception {
        String token = getStudentToken();

        // Named .pdf but containing non-PDF bytes
        MockMultipartFile corruptedFile = new MockMultipartFile(
                "file",
                "fake.pdf",
                "application/pdf",
                "NOT_A_REAL_PDF_HEADER".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/students/resume")
                        .file(corruptedFile)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid File Type"));
    }

    @Test
    void testDownloadAndPreviewResume_Success() throws Exception {
        String token = getStudentToken();

        // 1. Upload valid PDF first
        byte[] validPdfBytes = "%PDF-1.4\n% Sample PDF for preview\n%%EOF".getBytes();
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "preview_test.pdf",
                "application/pdf",
                validPdfBytes
        );

        mockMvc.perform(multipart("/api/v1/students/resume")
                        .file(pdfFile)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 2. Download resume
        mockMvc.perform(get("/api/v1/students/resume/download")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")));

        // 3. Preview resume inline
        mockMvc.perform(get("/api/v1/students/resume/preview")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("inline")));
    }

    @Test
    void testRecruiterAccessCandidateResume_Success() throws Exception {
        String studentToken = getStudentToken();
        String recruiterToken = getRecruiterToken();

        // Student (user ID 4 from seed data) uploads resume
        byte[] validPdfBytes = "%PDF-1.4\n% Candidate Resume\n%%EOF".getBytes();
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "guru_candidate_resume.pdf",
                "application/pdf",
                validPdfBytes
        );

        mockMvc.perform(multipart("/api/v1/students/resume")
                        .file(pdfFile)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // Recruiter previews candidate 4's resume
        mockMvc.perform(get("/api/v1/students/4/resume/preview")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void testUpdateProfile_Success() throws Exception {
        String token = getStudentToken();

        String updatePayload = "{" +
                "\"fullName\":\"Guru Prasad Updated\"," +
                "\"phone\":\"9876543210\"," +
                "\"gender\":\"male\"," +
                "\"cgpa\":9.20," +
                "\"branch\":\"Computer Science & Engineering\"," +
                "\"graduationYear\":2026," +
                "\"skillsJson\":\"Java, Spring Boot, React, Microservices, Docker\"" +
                "}";

        mockMvc.perform(put("/api/v1/students/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Guru Prasad Updated"))
                .andExpect(jsonPath("$.data.cgpa").value(9.20));
    }
}
