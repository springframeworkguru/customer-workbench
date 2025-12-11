package com.s7fundops.customerworkbench.controller;

import com.s7fundops.customerworkbench.model.InteractionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InteractionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("CSV upload then search returns stored interaction")
    void uploadCsvAndSearch() throws Exception {
        String header = "product_id,customer_id,interaction_type,customer_rating,feedback,timestamp,responses_from_customer_support";
        String row = "101,202,CHAT,5,Great support,2024-12-01 12:00:00,Thanks team";
        String csv = header + System.lineSeparator() + row;

        mockMvc.perform(multipart("/api/interactions")
                        .file("file", csv.getBytes())
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ingested").value(1));

        mockMvc.perform(get("/api/interactions")
                        .param("customerId", "202")
                        .param("interactionType", InteractionType.CHAT.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].customerId").value(202))
                .andExpect(jsonPath("$.content[0].interactionType").value(InteractionType.CHAT.name()));
    }
}