## FBR Digital Invoicing Architecture

```mermaid
flowchart LR
    subgraph Client Apps
        A[Vendor Portal]
        B[Backoffice]
    end

    subgraph API["NestJS API"]
        V[VendorModule]
        R[RegistryModule]
        Au[AuthModule]
        I[InvoiceModule]
        F[FbrModule]
    end

    subgraph FBR["FBR Sandbox/Prod"]
        FBRAPI[(REST Gateway)]
    end

    A -->|CRUD Vendors| V
    B -->|Approve| R
    V --> Au
    R --> Au
    Au --> I
    I --> F
    F --> FBRAPI
    FBRAPI --> F
```

### Module Summary

- `VendorModule`: Handles self-service registration (business type + role), admin CRUD, and password hashing.
- `RegistryModule`: tracks registration workflow, updates vendor registration status.
- `AuthModule`: validates email/password logins, mints bearer tokens, and exposes helpers to validate/resolve tokens.
- `InvoiceModule`: validates invoice payloads and relays to FBR after injecting vendor/token metadata.
- `FbrModule`: isolates outbound HTTP calls to FBR sandbox/prod URLs with logging and correlation IDs.
- `Guards & Decorators`: `AuthGuard`, `RolesGuard`, `Roles` decorator, and `CurrentVendor` decorator enforce bearer authentication + RBAC across controllers.
- `Common`: global logging interceptor, enums, DTO helpers used by modules.

Routers are versioned (`/v1/...`), documented via Swagger (`/docs`), and instrumented with the logging interceptor for team-ready observability.

