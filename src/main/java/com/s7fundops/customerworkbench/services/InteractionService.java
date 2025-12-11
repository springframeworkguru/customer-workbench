package com.s7fundops.customerworkbench.services;

import com.s7fundops.customerworkbench.model.InteractionLogDto;
import com.s7fundops.customerworkbench.model.InteractionSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface InteractionService {

    long ingestCsv(MultipartFile file);

    long ingestJson(List<InteractionLogDto> payload);

    InteractionLogDto create(InteractionLogDto dto);

    Page<InteractionLogDto> search(InteractionSearchCriteria criteria, Pageable pageable);

    InteractionLogDto findById(Long id);
}