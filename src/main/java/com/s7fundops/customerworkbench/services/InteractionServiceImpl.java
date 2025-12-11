package com.s7fundops.customerworkbench.services;

import com.opencsv.bean.CsvToBeanBuilder;
import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.mappers.InteractionLogMapper;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionSearchCriteria;
import com.s7fundops.customerworkbench.repositories.InteractionLogRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class InteractionServiceImpl implements InteractionService {

    private final InteractionLogRepository repository;
    private final InteractionLogMapper mapper;

    public InteractionServiceImpl(InteractionLogRepository repository, InteractionLogMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public long ingestCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file must not be empty");
        }

        List<InteractionLogDto> rows;
        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            rows = new CsvToBeanBuilder<InteractionLogDto>(reader)
                    .withType(InteractionLogDto.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build()
                    .parse();
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read CSV file", e);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage(), e);
        }

        if (CollectionUtils.isEmpty(rows)) {
            throw new IllegalArgumentException("CSV file is empty or missing required header");
        }

        validateDtos(rows);
        List<InteractionLog> entities = rows.stream()
                .map(mapper::toEntity)
                .toList();

        repository.saveAll(entities);
        return entities.size();
    }

    @Override
    public long ingestJson(List<InteractionLogDto> payload) {
        if (CollectionUtils.isEmpty(payload)) {
            throw new IllegalArgumentException("JSON payload must not be empty");
        }

        List<InteractionLog> entities = payload.stream()
                .map(mapper::toEntity)
                .toList();

        repository.saveAll(entities);
        return entities.size();
    }

    @Override
    public InteractionLogDto create(InteractionLogDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("InteractionLogDto is required");
        }

        InteractionLog entity = mapper.toEntity(dto);
        InteractionLog saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InteractionLogDto> search(InteractionSearchCriteria criteria, Pageable pageable) {
        if (criteria == null || criteria.getCustomerId() == null) {
            throw new IllegalArgumentException("customerId is required for search");
        }

        Specification<InteractionLog> specification = buildSpecification(criteria);
        return repository.findAll(specification, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public InteractionLogDto findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("id is required");
        }
        InteractionLog entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Interaction with id %d not found".formatted(id)));
        return mapper.toDto(entity);
    }

    private Specification<InteractionLog> buildSpecification(InteractionSearchCriteria criteria) {
        Specification<InteractionLog> spec = Specification.where((root, query, cb) -> cb.equal(root.get("customerId"), criteria.getCustomerId()));

        if (criteria.getProductId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("productId"), criteria.getProductId()));
        }
        if (criteria.getInteractionType() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("interactionType"), criteria.getInteractionType()));
        }

        LocalDateTime start = criteria.getStartDate();
        LocalDateTime end = criteria.getEndDate();
        if (start != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("interactionDate"), start));
        }
        if (end != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("interactionDate"), end));
        }
        return spec;
    }

    //todo refactor to use bean validation, not sure if OpenCSV supports it.
    private void validateDtos(List<InteractionLogDto> dtos) {
        dtos.forEach(dto -> {
            if (dto == null) {
                throw new IllegalArgumentException("Interaction entry must not be null");
            }
            Objects.requireNonNull(dto.getProductId(), "productId is required");
            Objects.requireNonNull(dto.getCustomerId(), "customerId is required");
            Objects.requireNonNull(dto.getInteractionType(), "interactionType is required");
        });
    }
}