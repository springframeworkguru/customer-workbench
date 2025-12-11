package com.s7fundops.customerworkbench.mappers;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.model.InteractionLogDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InteractionLogMapper {

    InteractionLogDto toDto(InteractionLog entity);

    @Mapping(target = "version", ignore = true)
    @Mapping(target = "dateCreated", ignore = true)
    @Mapping(target = "dateUpdated", ignore = true)
    InteractionLog toEntity(InteractionLogDto dto);
}
