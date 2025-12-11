package com.s7fundops.customerworkbench.services;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.mappers.InteractionLogMapper;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionSearchCriteria;
import com.s7fundops.customerworkbench.model.InteractionType;
import com.s7fundops.customerworkbench.repositories.InteractionLogRepository;
import net.datafaker.Faker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InteractionServiceImplTest {

    private final Faker faker = new Faker();

    @Mock
    private InteractionLogRepository repository;

    @Mock
    private InteractionLogMapper mapper;

    @InjectMocks
    private InteractionServiceImpl service;

    @Nested
    @DisplayName("CSV ingestion")
    class CsvIngestion {

        @Test
        @DisplayName("parses rows and saves entities")
        void ingestCsv_parsesAndPersistsRows() {
            String csv = "product_id,customer_id,interaction_type,customer_rating,feedback,timestamp,responses_from_customer_support\n" +
                    "10,20,CHAT,5,Great,2024-12-01 10:00:00,Thanks";
            MockMultipartFile file = new MockMultipartFile("file", "interactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

            when(mapper.toEntity(any(InteractionLogDto.class))).thenAnswer(invocation -> {
                InteractionLogDto dto = invocation.getArgument(0);
                InteractionLog entity = new InteractionLog();
                entity.setProductId(dto.getProductId());
                entity.setCustomerId(dto.getCustomerId());
                entity.setInteractionType(dto.getInteractionType());
                return entity;
            });

            long ingested = service.ingestCsv(file);

            assertThat(ingested).isEqualTo(1);
            verify(repository).saveAll(anyList());
        }

        @Test
        @DisplayName("rejects empty file")
        void ingestCsv_emptyFileThrows() {
            MockMultipartFile file = new MockMultipartFile("file", new byte[0]);

            assertThatThrownBy(() -> service.ingestCsv(file))
                    .isInstanceOf(IllegalArgumentException.class);
            verify(repository, never()).saveAll(anyList());
        }
    }

    @Nested
    @DisplayName("JSON ingestion")
    class JsonIngestion {

        @Test
        @DisplayName("rejects empty list")
        void ingestJson_emptyListThrows() {
            assertThatThrownBy(() -> service.ingestJson(List.of()))
                    .isInstanceOf(IllegalArgumentException.class);
            verify(repository, never()).saveAll(anyList());
        }
    }

    @Nested
    @DisplayName("Create and fetch")
    class CreateAndFetch {

        @Test
        @DisplayName("creates a new interaction and returns DTO")
        void create_returnsSavedDto() {
            InteractionLogDto dto = InteractionLogDto.builder()
                    .productId(faker.number().numberBetween(1, 99))
                    .customerId(faker.number().numberBetween(1, 99))
                    .interactionType(InteractionType.CHAT)
                    .build();

            InteractionLog entity = new InteractionLog();
            entity.setId(5L);
            entity.setProductId(dto.getProductId());
            entity.setCustomerId(dto.getCustomerId());
            entity.setInteractionType(dto.getInteractionType());

            when(mapper.toEntity(dto)).thenReturn(entity);
            when(repository.save(entity)).thenReturn(entity);
            when(mapper.toDto(entity)).thenReturn(InteractionLogDto.builder()
                    .id(5L)
                    .productId(dto.getProductId())
                    .customerId(dto.getCustomerId())
                    .interactionType(dto.getInteractionType())
                    .build());

            InteractionLogDto saved = service.create(dto);

            assertThat(saved.getId()).isEqualTo(5L);
            verify(repository).save(entity);
        }

        @Test
        @DisplayName("throws when id not found")
        void findById_notFound() {
            when(repository.findById(42L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.findById(42L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Search")
    class Search {

        @Test
        @DisplayName("requires customerId")
        void search_requiresCustomerId() {
            assertThatThrownBy(() -> service.search(null, PageRequest.of(0, 10)))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("delegates to repository with specification")
        void search_delegates() {
            InteractionSearchCriteria criteria = InteractionSearchCriteria.builder()
                    .customerId(123)
                    .interactionType(InteractionType.EMAIL)
                    .startDate(LocalDateTime.now().minusDays(5))
                    .endDate(LocalDateTime.now())
                    .build();

            when(repository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            service.search(criteria, PageRequest.of(0, 5));

            verify(repository).findAll(any(Specification.class), any(Pageable.class));
        }
    }
}