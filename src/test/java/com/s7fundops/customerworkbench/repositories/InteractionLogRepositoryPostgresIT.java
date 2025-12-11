package com.s7fundops.customerworkbench.repositories;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.model.InteractionType;
import com.s7fundops.customerworkbench.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * PostgreSQL-backed integration test for {@link InteractionLogRepository} using Testcontainers.
 * <p>
 * Activates the {@code postgres-it} Spring profile and imports a {@link TestcontainersConfiguration}
 * which provides a {@code PostgreSQLContainer} with {@code @ServiceConnection}, so Spring Boot will
 * auto-configure a {@code DataSource} pointing at the running container. Flyway will apply
 * migrations on startup against this ephemeral database.
 */
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("postgres-it")
@SpringBootTest
class InteractionLogRepositoryPostgresIT {

    @Autowired
    private InteractionLogRepository repository;

    @Test
    void savesAndReadsEntity() {
        InteractionLog log = new InteractionLog();
        log.setProductId(100);
        log.setCustomerId(200);
        log.setInteractionType(InteractionType.TICKET);
        log.setCustomerRating(4);
        log.setFeedback("Problem resolved");
        log.setInteractionDate(LocalDateTime.now().withNano(0));
        log.setResponsesFromCustomerSupport("Resolved via ticket #123");

        InteractionLog saved = repository.saveAndFlush(log);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getVersion()).isNotNull();
        assertThat(saved.getDateCreated()).isNotNull();

        InteractionLog found = repository.findById(saved.getId()).orElseThrow();
        assertThat(found.getProductId()).isEqualTo(100);
        assertThat(found.getCustomerId()).isEqualTo(200);
        assertThat(found.getInteractionType()).isEqualTo(InteractionType.TICKET);
        assertThat(found.getCustomerRating()).isEqualTo(4);
        assertThat(found.getFeedback()).isEqualTo("Problem resolved");
        assertThat(found.getResponsesFromCustomerSupport()).contains("ticket #123");
    }

    @Test
    void violatesNotNullConstraints() {
        InteractionLog log = new InteractionLog();
        // missing productId, customerId, interactionType

        assertThatThrownBy(() -> repository.saveAndFlush(log))
                .isInstanceOf(ConstraintViolationException.class);
    }
}
