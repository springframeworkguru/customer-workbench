# InteractionController and InteractionService implementation plan

## Required Spring MVC endpoints
1. **POST `/api/interactions/upload/csv`** – `multipart/form-data` with a single `file` part containing CSV with header `product_id,customer_id,interaction_type,customer_rating,feedback,timestamp,responses_from_customer_support`.
   - Validate non‑empty file and header columns.
   - Call `InteractionService.ingestCsv(MultipartFile file)`; return `201 Created` with `{ "ingested": <count> }` or `400` on validation/parse errors.
2. **POST `/api/interactions/upload/json`** – `application/json` body containing an array of `InteractionLogDto` (single object also allowed by coercing to a list).
   - Call `InteractionService.ingestJson(List<InteractionLogDto> payload)`; return `201 Created` with count summary.
3. **POST `/api/interactions`** – create a single interaction from `InteractionLogDto` JSON.
   - Call `InteractionService.create(InteractionLogDto dto)`; return created DTO with generated `id` and `location` header.
4. **GET `/api/interactions`** – paginated search & filter.
   - Query params: `customerId` (int), `productId` (int, optional), `interactionType` (enum), `startDate` and `endDate` (ISO date‑time for range on `interactionDate`), `page`, `size`, `sort` (default `interactionDate,desc`).
   - Call `InteractionService.search(criteria, pageable)`; return `Page<InteractionLogDto>` JSON. Use `@DateTimeFormat(iso = ISO.DATE_TIME)` for dates and `@PageableDefault` for paging defaults.
5. **GET `/api/interactions/{id}`** – fetch a single interaction by id; return `404` when missing. (Helpful for tests and UI drill‑down.)

## Service layer design
- Create interface `com.s7fundops.customerworkbench.services.InteractionService` with methods:
  - `long ingestCsv(MultipartFile file);`
  - `long ingestJson(List<InteractionLogDto> payload);`
  - `InteractionLogDto create(InteractionLogDto dto);`
  - `Page<InteractionLogDto> search(InteractionSearchCriteria criteria, Pageable pageable);`
  - `InteractionLogDto findById(Long id);`
- Add `InteractionSearchCriteria` record/class to carry optional filters (customerId, productId, interactionType, startDate, endDate).
- Default implementation `InteractionServiceImpl` (annotated `@Service`) responsibilities:
  - Parse CSV using OpenCSV bound to `InteractionLogDto` (reuse existing annotations) and validate required fields; accumulate errors with meaningful messages; wrap parse issues in `IllegalArgumentException` for `400` responses.
  - For JSON ingestion, validate list is non‑empty; reject null required fields; map to entities via `InteractionLogMapper`; bulk save with `repository.saveAll` inside `@Transactional`.
  - Single create delegates to common save path and returns saved DTO.
  - Search builds a dynamic query: either Spring Data `Example`/`Specification` or custom repository method; at minimum filter by provided criteria and apply `Pageable`. Default sort `interactionDate` desc.
  - `findById` fetches entity or throws `NoSuchElementException`/`EntityNotFoundException` so controller can render `404`.
  - All business logic (parsing, validation, filter construction) stays in the service; controller only orchestrates.

## Controller design (`InteractionController`)
- Annotate with `@RestController` and `@RequestMapping("/api/interactions")`; inject `InteractionService`.
- Methods:
  - `uploadCsv(MultipartFile file)` → calls `service.ingestCsv`; returns `201` with count or `400` on bad input.
  - `uploadJson(@RequestBody List<InteractionLogDto> payload)` → calls `service.ingestJson`; returns `201` with count.
  - `create(@RequestBody @Valid InteractionLogDto dto)` → calls `service.create`; returns `201` with `Location` header `/api/interactions/{id}`.
  - `getAll(...)` with `@RequestParam` filters and `Pageable` → calls `service.search`; returns page body.
  - `getOne(@PathVariable Long id)` → calls `service.findById`; returns DTO or `404`.
- Use `@Validated` on class to enforce bean validation; map `IllegalArgumentException` to `400` via `@ExceptionHandler` or rely on `@ControllerAdvice` if present.

## Testing directions
1. **Service unit tests (JUnit + Mockito):**
   - Mock `InteractionLogRepository` and `InteractionLogMapper`.
   - Verify CSV ingestion parses header, saves expected number of rows, and raises `IllegalArgumentException` on malformed/empty files.
   - Verify search builds correct criteria and delegates to repository with provided `Pageable`.
   - Validate single `create` calls mapper→repo→mapper chain and returns DTO with id.
2. **Controller tests (MockMvc + Mockito):**
   - Annotate `@WebMvcTest(InteractionController.class)` and mock `InteractionService`.
   - Cover: CSV upload (Multipart), JSON upload (array and single object), create single, search with filters (customerId, interactionType, date range), and 404 for missing id.
   - Assert HTTP statuses, response bodies, and service invocation arguments.
3. **Integration test (Spring Boot + H2):**
   - Use `@SpringBootTest`, `@AutoConfigureMockMvc`, and H2 datasource (no Testcontainers). Optionally `@TestPropertySource` for H2 URL and Flyway enablement.
   - Flow: POST `/api/interactions/upload/csv` with header + one row → expect `201` and ingested count 1. Then GET `/api/interactions?customerId=...` → expect 200 with stored entry matching CSV data. Optionally assert filtering by `interactionType` and date range works.
   - Keep DB clean between tests with `@Transactional` or `@DirtiesContext` per class.

## Implementation checklist
- Add `InteractionSearchCriteria` class, `InteractionService` interface, and `InteractionServiceImpl` using repository + mapper.
- Implement `InteractionController` endpoints above, delegating all business logic to service.
- Add request/response validation and consistent error handling for bad payloads.
- Create unit tests for service and controller; create integration test using H2 to exercise upload + retrieval end-to-end.