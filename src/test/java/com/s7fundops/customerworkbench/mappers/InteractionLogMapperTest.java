package com.s7fundops.customerworkbench.mappers;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionType;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class InteractionLogMapperTest {

    private final InteractionLogMapper mapper = Mappers.getMapper(InteractionLogMapper.class);

    @Test
    void toEntity_mapsAllSimpleFields_andIgnoresEntityOnlyFields() {
        LocalDateTime when = LocalDateTime.now().withNano(0);
        InteractionLogDto dto = InteractionLogDto.builder()
                .id(42L)
                .productId(10)
                .customerId(20)
                .interactionType(InteractionType.EMAIL)
                .customerRating(5)
                .feedback("Great support!")
                .interactionDate(when)
                .responsesFromCustomerSupport("You're welcome")
                .build();

        InteractionLog entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(42L);
        assertThat(entity.getProductId()).isEqualTo(10);
        assertThat(entity.getCustomerId()).isEqualTo(20);
        assertThat(entity.getInteractionType()).isEqualTo(InteractionType.EMAIL);
        assertThat(entity.getCustomerRating()).isEqualTo(5);
        assertThat(entity.getFeedback()).isEqualTo("Great support!");
        assertThat(entity.getInteractionDate()).isEqualTo(when);
        assertThat(entity.getResponsesFromCustomerSupport()).isEqualTo("You're welcome");

        // ignored fields
        assertThat(entity.getVersion()).isNull();
        assertThat(entity.getDateCreated()).isNull();
        assertThat(entity.getDateUpdated()).isNull();
    }

    @Test
    void toDto_mapsAllFieldsThatExistInDto() {
        LocalDateTime when = LocalDateTime.now().withNano(0);
        InteractionLog entity = new InteractionLog();
        entity.setId(7L);
        entity.setProductId(1);
        entity.setCustomerId(2);
        entity.setInteractionType(InteractionType.CHAT);
        entity.setCustomerRating(3);
        entity.setFeedback("ok");
        entity.setInteractionDate(when);
        entity.setResponsesFromCustomerSupport("answer");
        entity.setVersion(1L);

        InteractionLogDto dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(7L);
        assertThat(dto.getProductId()).isEqualTo(1);
        assertThat(dto.getCustomerId()).isEqualTo(2);
        assertThat(dto.getInteractionType()).isEqualTo(InteractionType.CHAT);
        assertThat(dto.getCustomerRating()).isEqualTo(3);
        assertThat(dto.getFeedback()).isEqualTo("ok");
        assertThat(dto.getInteractionDate()).isEqualTo(when);
        assertThat(dto.getResponsesFromCustomerSupport()).isEqualTo("answer");
    }
}
