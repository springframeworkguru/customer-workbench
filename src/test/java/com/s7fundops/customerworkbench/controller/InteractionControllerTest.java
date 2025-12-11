package com.s7fundops.customerworkbench.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionType;
import com.s7fundops.customerworkbench.services.InteractionService;
import com.s7fundops.customerworkbench.services.NotFoundException;
import net.datafaker.Faker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = InteractionController.class)
class InteractionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InteractionService interactionService;

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final Faker faker = new Faker();

    @Nested
    @DisplayName("Posts")
    class Posts {

        @Test
        @DisplayName("CSV upload returns ingested count")
        void uploadCsv() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "data.csv",
                    "text/csv",
                    "product_id,customer_id,interaction_type,customer_rating,feedback,timestamp,responses_from_customer_support\n1,2,CHAT,5,hi,2024-12-01 10:00:00,ok".getBytes(StandardCharsets.UTF_8)
            );

            when(interactionService.ingestCsv(any())).thenReturn(1L);

            mockMvc.perform(multipart("/api/interactions").file(file))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.ingested").value(1));

            verify(interactionService).ingestCsv(any());
        }
    }

    @Nested
    @DisplayName("Create")
    class CreateEndpoint {

        @Test
        @DisplayName("creates and returns DTO with location header")
        void create() throws Exception {
            InteractionLogDto dto = sampleDto();
            InteractionLogDto saved = InteractionLogDto.builder()
                    .id(10L)
                    .productId(dto.getProductId())
                    .customerId(dto.getCustomerId())
                    .interactionType(dto.getInteractionType())
                    .interactionDate(dto.getInteractionDate())
                    .build();

            when(interactionService.create(any())).thenReturn(saved);

            mockMvc.perform(post("/api/interactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", "/api/interactions/10"))
                    .andExpect(jsonPath("$.id").value(10));
        }
    }

    @Nested
    @DisplayName("Search and get")
    class SearchAndGet {

        @Test
        @DisplayName("search returns page of results")
        void search() throws Exception {
            InteractionLogDto dto = sampleDto();
            when(interactionService.search(any(), any())).thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1));

            mockMvc.perform(get("/api/interactions")
                            .param("customerId", dto.getCustomerId().toString())
                            .param("interactionType", dto.getInteractionType().name()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].customerId").value(dto.getCustomerId()));
        }

        @Test
        @DisplayName("returns 404 when not found")
        void getOne_notFound() throws Exception {
            when(interactionService.findById(eq(99L))).thenThrow(new NotFoundException("not found"));

            mockMvc.perform(get("/api/interactions/99"))
                    .andExpect(status().isNotFound());
        }
    }

    private InteractionLogDto sampleDto() {
        return InteractionLogDto.builder()
                .productId(faker.number().numberBetween(1, 999))
                .customerId(faker.number().numberBetween(1, 999))
                .interactionType(faker.options().option(InteractionType.class))
                .interactionDate(LocalDateTime.now().withNano(0))
                .feedback("feedback")
                .responsesFromCustomerSupport("response")
                .customerRating(4)
                .build();
    }
}