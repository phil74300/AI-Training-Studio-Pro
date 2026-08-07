# AI Architecture

Version: 1.0

## 1. Purpose and scope

This document is the normative artificial intelligence architecture specification for AI Training Studio Pro. It defines the boundaries, contracts, state models, security requirements, and evolution rules that apply to every AI feature.

All AI implementations must comply with this specification. New AI actions, providers, models, prompts, tools, and result types must integrate through the abstractions defined here. Architecture-breaking changes require explicit review and a new document version.

This specification governs AI orchestration and its integration with the Workspace. It does not authorize any provider implementation, Electron change, persistence change, or product feature by itself.

## 2. Design principles

- **Provider agnostic:** Application workflows depend on normalized contracts, never on a provider SDK or provider-specific response shape.
- **Human-controlled:** AI never silently changes, deletes, saves, exports, or publishes user content. Users select context and explicitly approve application of generated results.
- **Modular:** Actions, prompts, context selection, task orchestration, providers, results, and UI integration have separate responsibilities.
- **Secure:** Credentials, provider calls, IPC, logs, inputs, and generated outputs follow least-privilege and validation rules.
- **Observable:** Task transitions, normalized events, errors, timing, and usage can be inspected without exposing sensitive content by default.
- **Testable:** Every boundary has deterministic contracts that can be tested independently.
- **Incremental evolution:** The architecture supports future capabilities without requiring premature infrastructure or large rewrites.
- **Workspace-compatible:** AI services remain independent of DOM and editor implementation details. The Workspace owns renderer lifecycle and UI composition.

## 3. Global architecture

```text
Workspace UI
  → AIWorkspaceFacade
      → AIActionRegistry
      → AITaskService
          → PromptService
          → AIContextBuilder
          → AIProviderManager
              → ProviderAdapter
          → AIResultService
      → AIEventBus

Infrastructure
  → AITaskRepository
  → AISettingsRepository
  → CredentialStore
  → Secure Electron IPC
```

Dependencies flow inward through contracts. UI components may invoke the facade and subscribe to normalized state or events, but lower layers must not import UI components, manipulate the DOM, or access Tiptap directly.

## 4. Layer responsibilities

### Workspace UI

The Workspace UI presents actions, context choices, task progress, previews, errors, and approval controls. It may call `AIWorkspaceFacade` and subscribe to aggregate state or task events.

It must not:

- contain prompt templates;
- call provider SDKs or provider endpoints;
- access provider credentials;
- construct provider-specific requests;
- treat generated output as trusted content;
- apply AI results directly to Tiptap.

### AIWorkspaceFacade

The facade exposes workspace-oriented AI use cases and maps domain state into UI-safe view state. It coordinates services but does not implement provider protocols, prompt rendering, persistence, or editor manipulation.

It may validate that a requested action is available for the current workspace and forward explicit user selections. It must not become a general-purpose service containing all AI logic.

### AIActionRegistry

The registry defines application actions and their requirements. It owns stable action identifiers and application-facing metadata, not provider implementation details or UI event handling.

### AITaskService

The task service creates tasks, validates state transitions, schedules execution, coordinates prompts and context, invokes the provider manager, consumes normalized provider events, assembles results, records usage, handles cancellation and timeouts, and publishes task events.

It must not manipulate the DOM, Tiptap, or application navigation.

### PromptService

The prompt service stores, validates, versions, and renders prompt templates. It composes normalized prompts from declared variables and immutable context snapshots. It must not select UI elements or embed credentials.

### AIContextBuilder

The context builder creates immutable, explicit, provider-ready context snapshots. It enforces selection, provenance, budgets, ordering, deduplication, truncation, redaction, and stale-source checks. It must not automatically include an entire project or conversation.

### AIProviderManager

The provider manager registers adapters, validates configurations, discovers model capabilities, resolves an explicitly configured provider and model, and normalizes provider execution failures. It must not contain application prompts or editor behavior.

Automatic cross-provider fallback is outside the initial architecture and requires later approval because it affects privacy, cost, and output consistency.

### ProviderAdapter

An adapter translates normalized requests and execution events to and from one provider API. It may use provider SDKs only behind its contract. It must never manipulate the UI, editor, project data, or persistence directly.

### AIResultService

The result service validates, normalizes, versions, and prepares provider output for preview. It produces typed result envelopes and application-safe suggestions. It does not apply results to the editor.

### AIEventBus

The event bus distributes normalized task and availability events to interested services and UI projections. Events are identified by task and ordered by sequence. The bus is not a distributed broker and must not become a second source of task truth.

### Infrastructure interfaces

- `AITaskRepository` stores task state, recoverable metadata, final results, and redacted audit information.
- `AISettingsRepository` stores non-secret provider, model, action, and user preference settings.
- `CredentialStore` stores secrets using operating-system-backed secure storage and exposes them only to trusted execution code.
- `Secure Electron IPC` provides a narrow, schema-validated boundary between renderer requests and privileged main-process operations.

Infrastructure implementations must remain replaceable behind their interfaces.

## 5. AI Action Registry

Application actions are distinct from provider capabilities. Initial or anticipated actions include:

- generate lesson;
- improve text;
- summarize;
- translate;
- generate quiz;
- generate image;
- explain.

Each action definition must declare:

- stable `actionId`;
- display metadata or a reference to localized display metadata;
- required input and context types;
- required provider/model capabilities;
- prompt template ID;
- expected result type and schema version;
- approval and application strategy;
- availability constraints.

Actions must not assume a specific provider. An action is available only when its requirements are satisfied by the selected model and current context.

## 6. Provider Adapter contract

Every provider adapter must implement the following contract:

```text
id
validateConfiguration(config)
listModels(config)
getCapabilities(model, config)
execute(request, executionContext)
healthCheck(config)
```

- `id` is a stable provider identifier.
- `validateConfiguration(config)` validates configuration structure and required credentials without exposing secrets.
- `listModels(config)` returns normalized model descriptors available to the configuration.
- `getCapabilities(model, config)` returns normalized, model-level capabilities and limits.
- `execute(request, executionContext)` performs one normalized request and emits normalized execution events. `executionContext` supplies cancellation, event delivery, correlation, and runtime controls.
- `healthCheck(config)` reports normalized availability without changing application content.

Adapters must return or emit normalized contracts. Provider-specific errors must be mapped to stable categories while retaining safe diagnostic metadata. Providers must never manipulate the editor or UI directly.

### Provider health checks

Provider health checks use the provider-manager-controlled availability path and are separate from content execution tasks. They do not render prompts, create tasks or results, or generate content.

The normalized provider health states are:

- `AVAILABLE`;
- `UNAUTHORIZED`;
- `FORBIDDEN`;
- `UNREACHABLE`;
- `TIMEOUT`;
- `INVALID_CONFIGURATION`;
- `UNKNOWN_ERROR`.

An unavailable health result contains only a stable error code, its normalized category, a retryable flag, and a human-readable message. Raw provider errors, response bodies, stack traces, authorization headers, and credential material must not cross the trusted boundary.

Health checks requiring credentials execute only in trusted Electron code. The trusted health service resolves the credential through `CredentialStore`, performs the minimum non-generative provider request, and returns a normalized health result through `AIProviderManager`. Renderer-safe provider composition remains network-inert when no trusted health service is supplied.

## 7. Provider and model capabilities

Capabilities are discovered at the model level because models from the same provider may differ. A normalized capability descriptor must cover:

- supported input modalities;
- supported output modalities;
- streaming support;
- structured-output support;
- tool-calling support;
- reasoning support;
- context limit;
- output limit;
- supported generation parameters.

Capability discovery must be safe to cache with an explicit freshness policy. Unknown capabilities are treated as unsupported until validated. Application actions consume capability requirements; they do not become provider methods.

## 8. Normalized AI request contract

A normalized request must support:

- selected model ID;
- messages or other normalized input;
- validated multimodal inputs;
- normalized generation parameters;
- requested output schema and schema version;
- permitted tool definitions, when explicitly enabled;
- timeout;
- non-sensitive metadata and correlation information;
- a namespaced provider-specific extension object.

Provider-specific extensions must not be required by generic UI components or ordinary application actions. Requests are validated before crossing the privileged execution boundary. Unsupported parameters must be rejected or explicitly normalized; they must not be silently accepted with ambiguous behavior.

## 9. Task state machine

The normative task lifecycle is:

```text
CREATED → QUEUED → RUNNING
                    ├→ COMPLETED
                    ├→ FAILED
                    └→ CANCELLED
```

`COMPLETED`, `FAILED`, and `CANCELLED` are mutually exclusive terminal states. State transitions are validated centrally by `AITaskService`; repositories, providers, and UI components must not invent transitions.

Cancellation may be requested while queued or running. A queued task may transition directly to `CANCELLED`. A running task transitions only after cancellation has been acknowledged or execution has been safely terminated. Completion and cancellation races must be resolved atomically by the task service.

Possible future states are `RETRYING`, `WAITING_FOR_APPROVAL`, and `INTERRUPTED`. They are not part of version 1.0 and must not be introduced without reviewing transition semantics and persistence requirements.

## 10. Workspace AI availability

Workspace AI availability is separate from individual task state:

- `IDLE`: AI integration is not initialized for the workspace.
- `READY`: at least one valid execution path is available and no aggregate busy indication is required.
- `BUSY`: one or more relevant tasks are queued or running.
- `DEGRADED`: AI is usable with reduced capability or a recoverable provider/configuration problem.
- `UNAVAILABLE`: no valid execution path is available.

The Workspace status UI displays an aggregate projection derived from provider health, configuration, and relevant task states. It must not reuse one task's lifecycle value as global AI availability.

## 11. Task model

Every task must contain or reference:

- `id`;
- `projectId`;
- optional `chapterId`;
- `actionId`;
- `providerId`;
- `modelId`;
- normalized input;
- immutable context manifest;
- prompt template ID and version;
- creation, queue, start, update, and completion timestamps as applicable;
- current status;
- normalized progress;
- normalized result or error;
- normalized usage;
- retry count;
- correlation ID.

Task identifiers and correlation identifiers must be stable and non-secret. Progress is advisory and must not be used to infer completion.

The transient execution payload is distinct from persisted audit metadata. Full rendered prompts, raw source content, credentials, reasoning traces, and sensitive provider responses must not be persisted by default. Persisted records use redaction and retention policies and contain only the information required for recovery, user history, diagnostics, or approved auditing.

## 12. Prompt architecture

Every prompt template must declare:

- stable template ID;
- version;
- required and optional variables;
- validation rules;
- expected output schema and version;
- locale behavior;
- default generation parameters;
- provider/model capability requirements;
- deprecation and compatibility status.

Prompt composition follows this order:

```text
System policy
+ Action template
+ User instruction
+ Context
+ Output contract
```

Each layer remains identifiable for testing and auditing. Rendering must be deterministic for the same template version and normalized inputs, excluding explicitly declared runtime values.

No prompt may be hardcoded inside UI components. Prompt templates must not contain credentials or silently select context. Template changes require a new version when they can materially change behavior or output structure. Deprecated versions remain identifiable for historical tasks and are removed only through an explicit migration or retention policy.

## 13. Context architecture

Each AI task uses an immutable context snapshot. The context manifest records:

- explicitly selected sources;
- source provenance and identifiers;
- source content hashes or versions;
- estimated token usage and total token budget;
- deterministic ordering;
- truncation decisions;
- deduplication decisions;
- redaction decisions;
- stale-context status;
- destination provider and model;
- user confirmation when sensitivity or destination policy requires it.

The context builder must not automatically send the entire project. It must detect when selected sources have changed between preview and execution and either rebuild with user-visible disclosure or require confirmation, according to action policy.

Conversation history is an explicit, optional context source. It is never included solely because a conversation exists. Users must be able to inspect and exclude context sources before execution.

## 14. Streaming and event architecture

Normalized execution event types are:

- `started`;
- `content_delta`;
- `reasoning_delta`;
- `tool_call`;
- `tool_result`;
- `progress`;
- `usage`;
- `completed`;
- `cancelled`;
- `error`.

Each event contains:

- task ID;
- monotonically increasing sequence number within the task;
- timestamp;
- typed payload.

Providers emit events through the execution context. `AITaskService` validates and consumes them, updates authoritative task state, and publishes normalized events through `AIEventBus`. The UI subscribes by task ID or to an aggregate projection; it does not consume provider-native streams.

Cancellation uses `AbortSignal`. Adapters must stop producing useful work as soon as practical after abort. Late events are ignored once a terminal state is committed, except safe diagnostics explicitly marked as such. Event ordering is enforced by sequence number, and duplicate or out-of-order events must not corrupt assembled results.

UI rendering of high-frequency deltas must be throttled or batched. A stream error produces a normalized error and a valid terminal transition. Every execution has a timeout policy. Partial output retention must be explicit; incomplete content must never be presented as a completed result.

`reasoning_delta` is optional and must only carry provider-visible reasoning content that policy permits the application to display or retain. Internal or hidden reasoning is never requested, inferred, or persisted.

## 15. Typed result architecture

Every successful task produces a versioned result envelope with:

- result type;
- schema version;
- validated payload;
- provenance;
- provider and model identifiers;
- creation timestamp;
- safe usage and finish metadata;
- validation status and warnings.

Supported result families may include:

- text;
- structured data;
- quiz;
- image;
- file artifact;
- editor suggestion or patch;
- tool result.

Consumers must dispatch by result type and schema version. Unknown types or unsupported versions are not applied. Provider-native responses remain adapter diagnostics and are not the application result contract.

## 16. Human approval and editor application

The normative result lifecycle is:

```text
Generated result
  → Previewed
  → Accepted / Partially accepted / Regenerated / Discarded
  → Applied through EditorCommandRegistry
```

Task completion does not imply result approval. Approval and application are explicit user actions. Partial acceptance must produce a new validated application payload rather than mutating the provider response invisibly.

AI services and providers must never directly modify Tiptap. Accepted editor changes pass through `EditorCommandRegistry` so editor invariants and undo/redo behavior are preserved. Other artifact types require an equivalent explicit application boundary.

Normal project autosave may persist content after the user explicitly applies an AI result. AI task execution itself must not invoke project save, export, or publication operations.

## 17. Persistence and recovery

`AITaskRepository` is the authoritative persistence boundary for recoverable task data. It must support retrieval by task, project, status, and creation time as required by the product. Repository writes follow schema versioning and retention rules.

On application restart, non-terminal persisted tasks are reconciled according to provider and execution capabilities. Version 1.0 may mark unrecoverable in-flight work as failed with an interruption error rather than pretending execution continued. Recovery behavior must be visible to the user.

Execution uses a local scheduler with explicit global and per-provider concurrency limits. It must support queued cancellation, running cancellation, timeouts, provider rate limits, and bounded retries for classified transient failures. Retries must preserve correlation, increment retry count, respect cancellation, and avoid duplicating non-idempotent tool effects.

Distributed brokers, remote workers, and distributed coordination are outside the current architecture.

## 18. Electron security model

The following rules are normative:

- API keys and provider secrets never enter the renderer process.
- Credentials are stored using operating-system-backed secure storage.
- Provider network calls execute behind constrained main-process IPC or an equivalently privileged, isolated boundary approved by architecture review.
- The preload surface is narrow and exposes use-case-oriented operations rather than generic network or secret access.
- Every IPC request and response is schema-validated.
- UI components never receive raw credentials.
- Sensitive logs are redacted by default.
- IPC and provider requests enforce size limits and timeouts.
- Future tools require explicit allowlists, scoped permissions, and per-call approval where effects are possible.

The renderer is treated as untrusted relative to credentials and privileged operating-system capabilities. IPC callers must not be trusted merely because they originate from an application window.

### Native credential storage

The initial native credential-store implementation targets macOS Keychain through a direct Security.framework binding. It remains behind `CredentialStoreAdapter`, so trusted consumers depend only on `CredentialStore`. Secret records use stable application, provider, and credential identifiers. Safe metadata is stored separately from secret records and is the only credential data returned through renderer-facing IPC.

Native credential adapters are composed only in the Electron main process. Trusted `getSecret()` access is not part of the IPC or preload surface. Unsupported platforms return a normalized `unsupported-platform` error and must never fall back to files, local storage, environment variables, or command-line credential tools.

## 19. Privacy and safety

Before execution, the application must disclose the destination provider when user content will leave the device. Sensitive context requires explicit confirmation according to policy. Local-provider operation must not be described as offline unless the selected model and all dependencies execute locally.

Retention policies must define what is stored locally, what may be retained by a provider, and how users remove task history. Redaction applies to logs, audit records, telemetry, errors, and support diagnostics.

Imported sources and conversation content are untrusted and may contain prompt injection. They remain delimited context, cannot grant permissions, and cannot override system policy or user approval requirements.

Generated HTML, URLs, files, and images are untrusted until validated. The application must sanitize renderable content, restrict unsafe URL schemes, validate file types and sizes, and prevent implicit execution. Generated tool calls are proposals, not authorization.

Cost, request-rate, and output-size controls must prevent accidental or abusive consumption. Safety policies must be testable and applied consistently across providers.

## 20. Usage and cost accounting

Normalized usage may include:

- input units or tokens;
- output units or tokens;
- cached input units;
- reasoning units when the provider reports them safely;
- image or media units;
- tool calls;
- request duration;
- provider-reported cost and currency when available;
- locally estimated cost with an explicit estimate marker.

Unknown values remain unknown; the system must not fabricate precise usage. Provider usage is normalized without discarding safe raw category identifiers needed for reconciliation.

Future budget controls may enforce limits per task, project, provider, model, user period, or action. Budget checks occur before execution when predictable and during execution when streaming usage permits. Limit behavior must be user-visible and must produce normalized cancellation or failure semantics.

## 21. Testing strategy

AI implementation must include tests appropriate to each introduced layer:

- shared provider adapter contract tests;
- valid and invalid task transition tests;
- prompt rendering and template-version tests;
- context selection, ordering, budgeting, redaction, and stale-source tests;
- queued and running cancellation tests;
- streaming normalization, ordering, duplication, late-event, and error tests;
- IPC schema, authorization boundary, size-limit, and secret-exposure tests;
- typed result validation tests;
- result preview, approval, partial acceptance, discard, and editor-application tests.

Provider integrations use recorded or simulated responses for deterministic tests where permitted. Live-provider tests must be isolated, opt-in, credential-safe, and cost-bounded.

## 22. Staged implementation

Implementation must proceed incrementally. Each stage must preserve existing Workspace behavior, keep provider logic outside UI components, and leave the application releasable.

An appropriate progression is:

1. stabilize normalized contracts and distinct task/workspace state models;
2. introduce action, prompt, context, and result boundaries with test doubles;
3. introduce secure configuration and IPC contracts;
4. add one provider adapter behind contract tests;
5. add task scheduling, streaming, cancellation, and observability;
6. add preview, approval, and editor application through `EditorCommandRegistry`;
7. add persistence and recovery only to the degree required by approved product behavior;
8. extend providers, models, actions, and result types through existing contracts.

The initial implementation must not introduce prematurely:

- distributed brokers;
- remote workers;
- an autonomous agent runtime;
- automatic provider fallback;
- persistence of every streaming delta.

Any feature that requires exceptions to these boundaries must first update this specification through architecture review.
