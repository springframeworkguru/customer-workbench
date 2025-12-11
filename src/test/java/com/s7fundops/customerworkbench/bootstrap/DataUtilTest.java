package com.s7fundops.customerworkbench.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.opencsv.bean.CsvToBeanBuilder;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionType;
import org.junit.jupiter.api.Test;

import java.io.StringReader;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DataUtilTest {

    @Test
    void randomInteraction_populatesValidFields() {
        InteractionLogDto dto = DataUtil.randomInteraction();

        assertThat(dto.getId()).isNotNull().isPositive();
        assertThat(dto.getProductId()).isNotNull();
        assertThat(dto.getCustomerId()).isNotNull();
        assertThat(dto.getInteractionType()).isNotNull().isIn((Object[]) InteractionType.values());
        assertThat(dto.getCustomerRating()).isNotNull().isBetween(1, 5);
        assertThat(dto.getFeedback()).isNotNull().isNotBlank();
        assertThat(dto.getResponsesFromCustomerSupport()).isNotNull().isNotBlank();
        assertThat(dto.getInteractionDate()).isNotNull();

        // within last 60 days
        LocalDateTime now = LocalDateTime.now();
        Duration age = Duration.between(dto.getInteractionDate(), now);
        assertThat(age.toDays()).isBetween(0L, 60L);
    }

    @Test
    void randomInteractionAsJson_roundTripsWithJackson() throws Exception {
        String json = DataUtil.randomInteractionAsJson();

        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        InteractionLogDto dto = mapper.readValue(json, InteractionLogDto.class);

        assertThat(dto).isNotNull();
        assertThat(dto.getProductId()).isNotNull();
        assertThat(dto.getCustomerId()).isNotNull();
        assertThat(dto.getInteractionType()).isNotNull();
        assertThat(dto.getCustomerRating()).isBetween(1, 5);
    }

    @Test
    void randomInteractionAsCsv_canBindBackWithHeader() {
        String header = DataUtil.interactionCsvHeader();
        String row = DataUtil.randomInteractionAsCsv();
        String csv = header + System.lineSeparator() + row;

        List<InteractionLogDto> beans = new CsvToBeanBuilder<InteractionLogDto>(new StringReader(csv))
                .withType(InteractionLogDto.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build()
                .parse();

        assertThat(beans).hasSize(1);
        InteractionLogDto parsed = beans.get(0);

        // id is ignored by CSV mapping
        assertThat(parsed.getId()).isNull();
        assertThat(parsed.getProductId()).isNotNull();
        assertThat(parsed.getCustomerId()).isNotNull();
        assertThat(parsed.getInteractionType()).isNotNull();
        assertThat(parsed.getCustomerRating()).isBetween(1, 5);
        assertThat(parsed.getFeedback()).isNotNull();
        assertThat(parsed.getInteractionDate()).isNotNull();
        assertThat(parsed.getResponsesFromCustomerSupport()).isNotNull();
    }
}
