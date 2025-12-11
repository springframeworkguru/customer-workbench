package com.s7fundops.customerworkbench.controller;

import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionSearchCriteria;
import com.s7fundops.customerworkbench.model.InteractionType;
import com.s7fundops.customerworkbench.services.InteractionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/interactions")
@Validated
public class InteractionController {

    private final InteractionService interactionService;

    public InteractionController(InteractionService interactionService) {
        this.interactionService = interactionService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Long>> uploadCsv(@RequestPart("file") MultipartFile file) {
        long ingested = interactionService.ingestCsv(file);
        return buildCountResponse(ingested);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InteractionLogDto> create(@Valid @RequestBody InteractionLogDto dto) {
        InteractionLogDto created = interactionService.create(dto);
        URI location = URI.create("/api/interactions/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public Page<InteractionLogDto> getAll(@RequestParam(required = false) Integer customerId,
                                          @RequestParam(required = false) Integer productId,
                                          @RequestParam(required = false) InteractionType interactionType,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
                                          @PageableDefault(sort = "interactionDate", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        InteractionSearchCriteria criteria = InteractionSearchCriteria.builder()
                .customerId(customerId)
                .productId(productId)
                .interactionType(interactionType)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return interactionService.search(criteria, pageable);
    }

    @GetMapping("/{id}")
    public InteractionLogDto getOne(@PathVariable Long id) {
        return interactionService.findById(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> body = Map.of("error", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    private ResponseEntity<Map<String, Long>> buildCountResponse(long count) {
        Map<String, Long> body = new HashMap<>();
        body.put("ingested", count);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}