## Change Module Documentation

This reference explains every NestJS module, highlights the key data structures (“props”) that flow through them, and describes how_tokens and external services fit together. It also includes a step-by-step guide for wiring the project to MongoDB.

---

### 1. System Flow At A Glance

1. **Vendor registration** (`POST /v1/vendors/register`): payload hits `VendorController`, `VendorService` builds the vendor record, hashes the password, and stores it (currently in memory).
2. **Onboarding & approval**: `RegistryModule` links documents to the vendor and marks `isRegistered=true`.
3. **Authentication** (`POST /v1/auth/login`): `AuthService` validates email/password, mints a bearer token, and stores it in the token map.
4. **Protected APIs**: `AuthGuard` + `RolesGuard` inject the vendor into each request. Admin routes (CRUD vendors, view invoices) require `VendorRole.ADMIN`.
5. **Invoice registration** (`POST /v1/invoices/register`): `InvoiceService` persists the invoice, fetches the vendor’s token via `AuthService.getVendorToken`, then calls FBR through `FbrService`. Correlation IDs from FBR are saved on the invoice entity for traceability.

---

### 2. Module Deep Dives

#### `VendorModule`
- **Purpose**: Vendor lifecycle (self-registration + admin management).
- **Key props**:
  - `CreateVendorDto`: `displayName`, `gstNumber`, `address`, `email`, `contactPhone`, optional `businessType`, optional `role`, mandatory `password`.
  - `Vendor` entity: adds generated `id` (`"1"`, `"2"`, ...), `passwordHash`, `isRegistered`, timestamps.
- **Flow**:
  1. Controller receives DTO and delegates to `VendorService`.
  2. Service validates uniqueness by email, hashes password with `hashPassword`, assigns role (default `USER`) and business type (default `GENERAL`), then stores the vendor.
  3. Other modules inject the service to read/update vendors (e.g., `AuthService`, `RegistryService`, `InvoiceService`).
- **Access control**: `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(VendorRole.ADMIN)` restricts list/update/delete endpoints to admins only.

#### `RegistryModule`
- **Purpose**: Manage onboarding documents and registration status.
- **Key props**:
  - `RegistryRequestDto`: `vendorId`, `documentUrl`, `submittedBy`.
  - `RegistryRecord`: adds `status` enum (`SUBMITTED`, `APPROVED`, etc.) and `submittedAt`.
- **Flow**:
  1. `submit` verifies the vendor exists, sets status to `SUBMITTED`, saves record.
  2. `approve` flips status to `APPROVED` and calls `VendorService.markRegistered`.
  3. Status queries respond with the stored record so other services (or admins) can check readiness.

#### `AuthModule`
- **Purpose**: Authenticate vendors via email/password and issue bearer tokens.
- **Key props**:
  - `LoginRequestDto`: `email`, `password`.
  - `TokenResponseDto`: `accessToken`, `expiresIn`, `vendorId`.
  - Internal `TokenRecord`: stores `token`, `vendorId`, `issuedAt`, `expiresIn`.
- **Flow**:
  1. `login` calls `VendorService.validateCredentials`, throws if invalid.
  2. Generates a 32-byte hex token, caches it in two maps (token lookup + vendor lookup) with a 1-hour TTL.
  3. `AuthGuard.validateToken` reads the bearer header, fetches the vendor, and attaches it to the request.
  4. `InvoiceService` uses `getVendorToken` to retrieve the vendor’s current token for outbound FBR calls.

#### `InvoiceModule`
- **Purpose**: Accept invoices from authenticated vendors and relay them to FBR.
- **Key props**:
  - `CreateInvoiceDto`: `totalAmount`, `currency`, `payload`.
  - `Invoice` entity: adds `id`, `vendorId`, `status` (`PENDING`, `REGISTERED`, `FAILED`), `fbrCorrelationId`, `createdAt`.
- **Flow**:
  1. `InvoiceController.register` requires authentication. The `CurrentVendor` decorator injects the vendor so the service doesn’t rely on a user-supplied `vendorId`.
  2. Service generates an invoice ID, stores it, then calls `FbrService.post` with `{ vendor, invoice: dto.payload }`.
  3. Response determines the invoice status and stores the FBR correlation ID.
  4. Read endpoints enforce ownership (owner or admin) and provide an admin-only `GET /vendor/:vendorId`. `GET /mine` lists invoices for the logged-in vendor.

#### `FbrModule`
- **Purpose**: Encapsulate HTTP calls to the FBR sandbox/prod endpoints.
- **Key props**:
  - `FbrService.post` arguments: `path`, `payload`, `token`.
  - Response type `FbrResponse<T>`: `data`, `correlationId`.
- **Flow**:
  1. Builds the REST URL from `FBR_SANDBOX_BASE_URL` (configurable via `.env` or environment variables).
  2. Uses Axios through Nest’s `HttpService` to POST with the vendor’s bearer token.
  3. Captures `x-correlation-id` header and logs failures before rethrowing.

#### `Common` Utilities
- **Intercepting/Logging**: `LoggingInterceptor` measures request duration.
- **Authentication helpers**: `AuthGuard`, `RolesGuard`, `@Roles`, `@CurrentVendor`.
- **Enums & DTO helpers**: `BusinessType`, `VendorRole`, and password hashing utilities (`hashPassword`, `verifyPassword`).

---

### 3. Token Catalogue

| Token | Source | Stored in | Consumed by | Purpose |
| ----- | ------ | --------- | ----------- | ------- |
| Bearer `accessToken` | `POST /auth/login` via `AuthService.login` | `AuthService` token maps | `AuthGuard`, `RolesGuard`, `InvoiceService` | Grants access to protected APIs and authenticates outbound FBR calls. |
| `expiresIn` (TTL) | Constant (3600s) assigned per token | `TokenRecord` | `AuthService.assertNotExpired` | Forces reauthentication after one hour. |
| FBR `x-correlation-id` | HTTP response from FBR sandbox | `Invoice.fbrCorrelationId` | Observability/logging tools, API responses | Trace invoice submissions between our API and FBR. |

> Tokens currently live in memory; move them to MongoDB (or Redis) for a production setup.

---

### 4. Connecting To MongoDB

1. **Install dependencies**  
   ```bash
   npm install @nestjs/mongoose mongoose
   ```

2. **Create `DatabaseModule`** (`src/database/database.module.ts`)  
   ```ts
   import { Module } from '@nestjs/common';
   import { MongooseModule } from '@nestjs/mongoose';
   import { ConfigService } from '@nestjs/config';

   @Module({
     imports: [
       MongooseModule.forRootAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
           uri: config.get<string>('MONGODB_URI') ?? 'mongodb://localhost:27017/fbr',
         }),
       }),
     ],
     exports: [MongooseModule],
   })
   export class DatabaseModule {}
   ```

3. **Register the module** in `app.module.ts`  
   ```ts
   @Module({
     imports: [
       ConfigModule.forRoot({ isGlobal: true }),
       DatabaseModule,
       VendorModule,
       AuthModule,
       RegistryModule,
       InvoiceModule,
       FbrModule,
     ],
   })
   export class AppModule {}
   ```

4. **Define schemas & repositories**  
   - Create Mongoose schemas for `Vendor`, `RegistryRecord`, `Invoice`, and optionally a `TokenSession`.
   - Replace in-memory `Map` usage with injected Models inside the corresponding services. For example, `VendorService` should `@InjectModel(Vendor.name)` and call `model.create`, `model.findById`, etc.

5. **Environment configuration**  
   - Add `MONGODB_URI=mongodb://<user>:<pass>@host:port/db` to `.env`.
   - Document the variable in `README.md` so teammates know how to run the API locally.

6. **Data lifecycle**  
   - Use `timestamps: true` in schemas to keep `createdAt`/`updatedAt`.
   - Store password hashes and roles exactly as in the current interface to avoid breaking guards.
   - For tokens, consider a TTL index on the collection so expired sessions are purged automatically.

7. **Testing**  
   - Use an in-memory MongoDB server (via `mongodb-memory-server`) or a dedicated test database. Update Jest setup to connect/disconnect before/after suites.

With these steps the MongoDB connection is centralized in `DatabaseModule`, while each feature module continues to focus on its own domain logic.

---

### 5. Data Flow Recap

- **Props entering the system**: DTOs (`CreateVendorDto`, `LoginRequestDto`, `CreateInvoiceDto`, `RegistryRequestDto`) describe the payloads from clients; validation pipes enforce them globally.
- **State transitions**:
  1. DTO → Service → Entity/Model (vendor/invoice/registry record)
  2. Vendor approval toggles `isRegistered`, which is required before tokens can be issued.
  3. Tokens authorize invoices, and invoice outcomes store FBR metadata for auditing.
- **Cross-module dependencies**:
  - `AuthService` depends on `VendorService`.
  - `InvoiceService` depends on `AuthService` (for tokens) and `FbrService`.
  - `RegistryService` depends on `VendorService`.
  - Guards/decorators rely on `AuthService` to hydrate the request context for downstream controllers.

This layered approach keeps responsibilities clear while making it straightforward to drop in MongoDB persistence or additional modules in the future.


