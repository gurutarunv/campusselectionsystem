package com.campusplacement;

import com.campusplacement.controller.JobController;
import com.campusplacement.dto.JobResponse;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.JobType;
import com.campusplacement.security.CustomUserDetailsService;
import com.campusplacement.security.JwtTokenProvider;
import com.campusplacement.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void getJobs_PublicEndpoint_Returns200WithJobList() throws Exception {
        JobResponse job = new JobResponse();
        job.setId(1L);
        job.setTitle("Software Engineer");
        job.setCompanyName("Google LLC");
        job.setStream(JobStream.IT);
        job.setJobType(JobType.FULL_TIME);
        job.setMinCgpa(BigDecimal.valueOf(8.0));
        job.setLocation("Bengaluru");
        job.setSalaryPackage("24 LPA");
        job.setStatus(JobStatus.ACTIVE);

        when(jobService.getActiveJobs(any(), any())).thenReturn(Collections.singletonList(job));

        mockMvc.perform(get("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Software Engineer"))
                .andExpect(jsonPath("$.data[0].companyName").value("Google LLC"));
    }
}
