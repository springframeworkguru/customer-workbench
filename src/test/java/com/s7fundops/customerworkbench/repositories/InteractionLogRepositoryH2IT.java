package com.s7fundops.customerworkbench.repositories;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.model.InteractionType;
import org.junit.jupiter.api.Test;


import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.test.context.ContextConfiguration;
import com.s7fundops.customerworkbench.CustomerWorkbenchApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.TestPropertySource;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class InteractionLogRepositoryH2IT {

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
