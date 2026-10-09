package com.campusplacement;

import com.campusplacement.controller.JobController;
import com.campusplacement.dto.JobResponse;
import com.campusplacement.enums.JobStatus;
import com.campusplacement.enums.JobStream;
import com.campusplacement.enums.JobType;
import com.campusplacement.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class JobControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JobService jobService;

    @InjectMocks
    private JobController jobController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(jobController).build();
    }

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
