package com.s7fundops.customerworkbench.bootstrap;

import com.opencsv.CSVWriter;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import net.datafaker.Faker;

import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.Locale;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Utility for generating test data for {@link InteractionLogDto}.
 */
public final class DataUtil {

    private static final Faker FAKER = new Faker(Locale.ENGLISH);
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private DataUtil() {
    }

    /**
     * Create a randomly populated {@link InteractionLogDto} using DataFaker.
     */
    public static InteractionLogDto randomInteraction() {
        // epoch millis for id
        long id = System.currentTimeMillis();

        // EAN-8 numeric codes for product/customer; parse to Integer as DTO expects Integer
        Integer productId = parseIntSafe(FAKER.code().ean8());
        Integer customerId = parseIntSafe(FAKER.code().ean8());

        // rating 1..5 inclusive
        int rating = ThreadLocalRandom.current().nextInt(1, 6);

        // feedback and response strings
        String feedback = FAKER.chuckNorris().fact();
        String response = FAKER.backToTheFuture().quote();

        // timestamp now minus 1..60 days
        int daysAgo = ThreadLocalRandom.current().nextInt(1, 61);
        LocalDateTime interactionDate = LocalDateTime.now().minusDays(daysAgo);

        // pick a random interaction type
        InteractionType interactionType = FAKER.options().option(InteractionType.class);

        return InteractionLogDto.builder()
                .id(id)
                .productId(productId)
                .customerId(customerId)
                .interactionType(interactionType)
                .customerRating(rating)
                .feedback(feedback)
                .interactionDate(interactionDate)
                .responsesFromCustomerSupport(response)
                .build();
    }

    /**
     * Create a random interaction and return it as a JSON string.
     */
    public static String randomInteractionAsJson() {
        try {
            return MAPPER.writeValueAsString(randomInteraction());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize InteractionLogDto to JSON", e);
        }
    }

    /**
     * Create a random interaction and return it as a single CSV row string (no header).
     * The column order matches {@link #interactionCsvHeader()}.
     */
    public static String randomInteractionAsCsv() {
        InteractionLogDto dto = randomInteraction();

        StringWriter out = new StringWriter();
        try (CSVWriter writer = new CSVWriter(out)) {
            DateTimeFormatter csvTs = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String[] row = new String[] {
                    // product_id, customer_id, interaction_type, customer_rating, feedback, timestamp, responses_from_customer_support
                    safe(dto.getProductId()),
                    safe(dto.getCustomerId()),
                    dto.getInteractionType() != null ? dto.getInteractionType().name() : "",
                    safe(dto.getCustomerRating()),
                    nullToEmpty(dto.getFeedback()),
                    dto.getInteractionDate() != null ? dto.getInteractionDate().format(csvTs) : "",
                    nullToEmpty(dto.getResponsesFromCustomerSupport())
            };
            writer.writeNext(row, false);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to write CSV row", e);
        }
        return out.toString().trim();
    }

    /**
     * Convenience method returning the CSV header for {@link InteractionLogDto}.
     */
    public static String interactionCsvHeader() {
        // Order aligned with @CsvBindByName annotations in InteractionLogDto
        String[] header = new String[] {
                "product_id",
                "customer_id",
                "interaction_type",
                "customer_rating",
                "feedback",
                "timestamp",
                "responses_from_customer_support"
        };

        StringWriter out = new StringWriter();
        try (CSVWriter writer = new CSVWriter(out)) {
            writer.writeNext(header, false);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to write CSV header", e);
        }
        return out.toString().trim();
    }

    private static Integer parseIntSafe(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException e) {
            // fallback to a random 8-digit number if parsing fails
            return ThreadLocalRandom.current().nextInt(10_000_000, 100_000_000);
        }
    }

    private static String safe(Integer n) {
        return n == null ? "" : Integer.toString(n);
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
