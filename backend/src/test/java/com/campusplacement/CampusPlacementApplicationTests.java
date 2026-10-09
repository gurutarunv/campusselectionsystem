package com.campusplacement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class CampusPlacementApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring Boot ApplicationContext loads successfully with all beans and configurations
    }
}
