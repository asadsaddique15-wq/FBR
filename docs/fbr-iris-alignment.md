# FBR IRIS System Alignment Documentation

This document explains how each module in this FBR Digital Invoicing system aligns with the real FBR IRIS (Federal Board of Revenue - Invoice Reporting and Invoicing System) processes and requirements.

---

## 1️⃣ Vendor Module

### In Real FBR IRIS System

✔ **Every business must register its POS (Point of Sale) with FBR.**
- FBR requires all businesses operating POS systems to register them officially.
- Each POS must have a unique identifier issued by FBR.

✔ **A vendor (shop) must be approved by FBR first.**
- Vendors cannot send invoices until they are fully approved by FBR.
- Approval involves document verification and compliance checks.

✔ **Vendors then use their FBR-issued integration keys to send invoices.**
- After approval, FBR issues integration keys/credentials.
- These keys are used to authenticate API requests to FBR.

📌 **Important**: Vendors don't use "username/password" usually — they use FBR-issued keys for API authentication.

### What It Does in This Project

- **Vendor Registration**: `POST /v1/vendors/register` allows vendors to self-register with business details.
- **Vendor Management**: Admins can view, update, and manage vendor records.
- **Registration Status Tracking**: Vendors have an `isRegistered` flag that tracks FBR approval status.
- **Business Information**: Stores vendor details including `displayName`, `gstNumber`, `address`, `businessType`, etc.

### Implementation Alignment

✅ **Correct Implementation**: The `VendorModule` now stores the exact credentials FBR issues in production:
- `posId`: automatically issued once a vendor is approved
- `integrationKey` + `integrationSecret`: mocked keys saved against the vendor for FBR communication
- `isRegistered`: must be true (and credentials present) before invoices can be created

These additions let downstream modules enforce credential checks. Multi-POS management remains a future enhancement.

---

## 2️⃣ Auth Module

### In Real FBR IRIS System

Vendors authenticate using:
- **POS ID**: Unique identifier for the Point of Sale system
- **Username/Password**: Traditional credentials
- **API Key**: FBR-issued API keys for programmatic access
- **Digital Certificates**: PKI-based authentication for secure communication

### What It Does in This Project

- **Handles login of vendors**: `POST /v1/auth/login` validates vendor credentials
- **Issues tokens for secured routes**: Returns JWT bearer tokens for API authentication
- **Ensures only authenticated vendors can create invoices**: Guards protect invoice endpoints

### Implementation Alignment

✅ **Your implementation is correct because**:

1. **You simulate FBR authentication**: The system validates vendor credentials and issues tokens
2. **It allows your own app to authenticate vendors**: Vendors authenticate with your system first, then your system communicates with FBR
3. **Layered authentication**: Vendors authenticate with your app (email/password), and your app handles FBR communication (can use FBR-issued keys)

📌 **Architecture**: This is a common pattern where:
- Internal authentication (email/password) → Your system's bearer token
- External authentication (FBR API keys) → Handled by your FBR module when communicating with FBR

---

## 3️⃣ Registry Module

### In Real FBR IRIS System

This mirrors the **FBR POS Registration Process**:

1. **Vendor submits documents** → FBR receives registration documents
2. **FBR reviews** → FBR verifies documents and compliance
3. **FBR approves vendor** → Vendor status changes to approved
4. **FBR issues POS ID** → Approved vendor receives POS identifier and integration credentials

### What It Does in This Project

- **Vendor uploads registration documents**: `POST /v1/registry/request` accepts document URLs and vendor information
- **Admin (or system) can approve vendor registration**: `PATCH /v1/registry/:vendorId/approve` processes submissions and validates documents
- **Admin can reject vendor registration**: `RegistryService.reject()` method handles rejection (can be extended with controller endpoint)
- **Check registration status**: `GET /v1/registry/:vendorId/status` returns current registration status
- **Once approved → vendor is marked registered**: Sets `isRegistered: true` on vendor record

### Implementation Alignment

✅ **This module correctly fits real FBR workflow**:

- **Document Submission**: Matches FBR's document upload requirement
- **Review Process**: Admin approval simulates FBR's review process
- **Status Tracking**: Registry status (`SUBMITTED`, `APPROVED`, `REJECTED`) mirrors FBR's approval states
- **Credential Issuance**: Approval now generates a POS ID plus integration key/secret that are persisted on the registry record and vendor
- **Vendor Approval**: When approved, vendor becomes eligible to send invoices (just like FBR)

📋 **Workflow Match**:
```
Real FBR: Submit Documents → FBR Review → Approval/Rejection → POS ID Issued (if approved)
This System: Submit Documents → Admin Review → Approval/Rejection → isRegistered = true (if approved)
```

**Registry Status States**:
- `PENDING`: Initial state (not used in current implementation)
- `SUBMITTED`: Documents have been submitted by vendor
- `APPROVED`: Admin approved the registration → vendor becomes `isRegistered: true`
- `REJECTED`: Admin rejected the registration → vendor remains unregistered

**API Endpoints**:
- `POST /v1/registry/request` - Submit registration documents
- `PATCH /v1/registry/:vendorId/approve` - Approve vendor registration
- `GET /v1/registry/:vendorId/status` - Check registration status
- `RegistryService.reject()` - Reject vendor registration (service method available)

---

## 4️⃣ Invoice Module

### In Real FBR IRIS System

1. **Vendors generate invoices (POS)**: POS systems create invoices with unique numbers
2. **POS sends the invoice to FBR in real-time**: Invoice data transmitted to FBR immediately
3. **FBR responds with QR code + digital signature**: FBR validates and returns:
   - QR code for customer verification
   - Digital signature proving FBR acceptance
   - Correlation ID for tracking
4. **Vendor prints invoice with QR code for customer**: Final invoice includes FBR-generated QR code

### What It Does in This Project

- **Vendor creates invoices**: `POST /v1/invoices/register` accepts invoice data (requires authentication)
- **Every invoice gets**:
  - ✅ Unique number (generated: `{vendorId}-{counter}` formatted as `{vendorId}-{6-digit-counter}`)
  - ✅ POS ID (`posId` field, defaults to `'POS01'` if not provided)
  - ✅ Items (array of invoice line items with details):
    - `description`: Item description
    - `quantity`: Number of items
    - `price`: Unit price
    - `taxRate`: Tax rate percentage
  - ✅ Buyer details (buyer information object):
    - `name`: Buyer's name
    - `ntn`: Buyer's NTN (National Tax Number) - required for tax compliance
    - `address`: Buyer's address
  - ✅ Totals (`totalAmount`, `currency`)
  - ✅ Time & date (`dateTime` field, defaults to current ISO timestamp if not provided)
  - ✅ QR code (from FBR response after validation)
  - ✅ Digital signature (from FBR response after validation)
- **Then it is sent to FBR**: Through `FbrService.post()` with the vendor's issued POS + integration credentials
- **FBR responds with**:
  - ✅ Acceptance/rejection (`status: 'ACCEPTED' | 'REJECTED'`)
  - ✅ Digital signature (`digitalSignature` field)
  - ✅ QR code (`qrCode` field)
  - ✅ Correlation ID (`fbrCorrelationId` field)

### Implementation Alignment

✅ **Your invoice module is correctly implementing real FBR digital invoicing logic**:

| Real FBR Requirement | This Implementation |
|---------------------|-------------------|
| Unique invoice number | ✅ Generated per vendor: `{vendorId}-{6-digit-counter}` |
| POS ID | ✅ Enforced to match the vendor's issued `posId` and auto-populated if omitted |
| Invoice items | ✅ Array with: `description`, `quantity`, `price`, `taxRate` |
| Buyer information | ✅ Buyer object with: `name`, `ntn` (NTN required), `address` |
| Total amounts | ✅ `totalAmount` + `currency` |
| Timestamp | ✅ `dateTime` field (ISO format, defaults to current time) |
| FBR validation | ✅ Sent to FBR module automatically on creation |
| QR code | ✅ Stored from FBR response (base64 encoded) |
| Digital signature | ✅ Stored from FBR response (hex string) |
| Correlation tracking | ✅ `fbrCorrelationId` stored for FBR traceability |
| Invoice status | ✅ `PENDING` → `REGISTERED` (accepted) or `FAILED` (rejected/error) |

📊 **Invoice Status Flow**:
```
PENDING → (Sent to FBR) → REGISTERED (if accepted) or FAILED (if rejected/error)
```

**Invoice Status States**:
- `PENDING`: Invoice created but not yet sent to FBR, or sent but no response yet
- `REGISTERED`: FBR accepted the invoice and returned QR code + signature
- `FAILED`: FBR rejected the invoice or network/system error occurred

**API Endpoints**:
- `POST /v1/invoices/register` - Create and submit invoice to FBR (requires authentication)
- `GET /v1/invoices/:id` - Get single invoice (owner or admin only)
- `GET /v1/invoices/mine` - List all invoices for authenticated vendor
- `GET /v1/invoices/vendor/:vendorId` - List all invoices for specific vendor (admin only)

**Access Control**:
- All invoice endpoints require authentication via `AuthGuard`
- Only invoice owner or admin can view individual invoices
- Only admins can view invoices from other vendors
- Vendors can only view their own invoices via `/mine` endpoint

This matches real FBR's invoice lifecycle.

---

## 5️⃣ FBR Module

### In Real FBR IRIS System

The actual FBR system:
- **Validates every invoice**: Checks tax rules, compliance, data integrity
- **Applies tax rules**: Calculates taxes based on Pakistan's tax regulations
- **Generates FBR QR code**: Creates unique QR code for invoice verification
- **Stores invoice centrally**: Maintains central database of all invoices
- **Sends response back to POS**: Returns status, QR code, signature, correlation ID

### What It Does in This Project

- **Simulates communication with FBR**: `FbrService.post()` mimics FBR API calls
- **Accepts or rejects an invoice**: Returns `ACCEPTED` or `REJECTED` status
- **Returns QR code + digital signature**: Generates mock QR code (base64) and digital signature (hex)
- **Mimics FBR API behaviour**: Simulates HTTP communication patterns with async delay
- **Health check endpoint**: `GET /v1/fbr/ping` returns module status (for monitoring/debugging)

### Implementation Alignment

✅ **Your mock FBR module is accurate**:

1. **Simulation Purpose**: For development/testing without hitting real FBR APIs
2. **Response Structure**: Matches expected FBR response format:
   ```typescript
   {
     status: 'ACCEPTED' | 'REJECTED',
     qrCode: string,
     digitalSignature: string,
     correlationId: string
   }
   ```
3. **Correlation IDs**: Generates correlation IDs like real FBR for tracking
4. **Async Communication**: Simulates network delay and async responses

🔄 **Production Integration**:
When ready for production, replace mock with actual FBR API calls:
- Use real FBR sandbox/production URLs
- Implement proper error handling for FBR responses
- Handle FBR authentication (API keys, certificates)
- Parse real FBR response format

---

## System Flow Comparison

### Real FBR IRIS Flow

```
1. Business registers with FBR
   ↓
2. FBR reviews documents
   ↓
3. FBR approves & issues POS ID + API keys
   ↓
4. Vendor authenticates (POS ID + keys)
   ↓
5. POS generates invoice
   ↓
6. Invoice sent to FBR in real-time
   ↓
7. FBR validates & responds (QR code + signature)
   ↓
8. Vendor prints invoice with QR code
```

### This System Flow

```
1. Vendor registers (POST /v1/vendors/register)
   - Creates vendor record with business details
   - Sets isRegistered = false initially
   ↓
2. Vendor submits documents (POST /v1/registry/request)
   - Uploads registration documents (documentUrl)
   - Status: SUBMITTED
   ↓
3. Admin reviews & approves (PATCH /v1/registry/:vendorId/approve)
   - Admin validates documents
   - If approved: Status → APPROVED, vendor.isRegistered = true
   - If rejected: Status → REJECTED, vendor remains unregistered
   ↓
4. Vendor logs in (POST /v1/auth/login)
   - Authenticates with email/password
   - Receives JWT bearer token (valid for 30 days)
   ↓
5. Vendor creates invoice (POST /v1/invoices/register)
   - Provides invoice data: items, buyer (with NTN), totals
   - System generates unique invoice number
   - Invoice status: PENDING
   ↓
6. System automatically sends to FBR (FbrService.post())
   - Uses vendor's authentication token
   - Sends invoice payload to FBR mock service
   - Waits for FBR response (simulated delay)
   ↓
7. FBR responds with validation result
   - If ACCEPTED: QR code (base64) + digital signature (hex) + correlation ID
   - If REJECTED: Error response
   ↓
8. Invoice updated with FBR response
   - Status: REGISTERED (if accepted) or FAILED (if rejected/error)
   - Stores: qrCode, digitalSignature, fbrCorrelationId
   - Invoice ready for printing with QR code
```

✅ **Perfect Alignment**: Your system correctly implements the FBR workflow with appropriate abstractions for development and testing.

---

## Complete API Endpoint Reference

### Vendor Module
- `POST /v1/vendors/register` - Self-service vendor registration (public)
- `GET /v1/vendors` - List all vendors (admin only)
- `GET /v1/vendors/:id` - Get vendor details (admin only)
- `PATCH /v1/vendors/:id` - Update vendor (admin only)
- `DELETE /v1/vendors/:id` - Delete vendor (admin only)

### Auth Module
- `POST /v1/auth/login` - Authenticate vendor (email/password) → Returns JWT token

### Registry Module
- `POST /v1/registry/request` - Submit registration documents (public)
- `PATCH /v1/registry/:vendorId/approve` - Approve vendor registration (admin)
- `GET /v1/registry/:vendorId/status` - Check registration status (public)

### Invoice Module
- `POST /v1/invoices/register` - Create and submit invoice to FBR (authenticated)
- `GET /v1/invoices/:id` - Get single invoice (owner or admin only)
- `GET /v1/invoices/mine` - List authenticated vendor's invoices
- `GET /v1/invoices/vendor/:vendorId` - List vendor's invoices (admin only)

### FBR Module
- `GET /v1/fbr/ping` - Health check endpoint (public)

---

## Key Takeaways

1. ✅ **Vendor Module**: Correctly tracks vendor registration and approval status
   - Handles vendor lifecycle: registration → approval → invoice creation
   - Enforces `isRegistered` flag before allowing invoice submission

2. ✅ **Auth Module**: Properly authenticates vendors before allowing invoice creation
   - Email/password authentication with JWT tokens
   - 30-day token expiration
   - Supports internal authentication while preparing for FBR API key integration

3. ✅ **Registry Module**: Accurately simulates FBR's document-based approval process
   - Document submission workflow
   - Status tracking: SUBMITTED → APPROVED/REJECTED
   - Automatic vendor registration upon approval

4. ✅ **Invoice Module**: Correctly implements FBR's invoice format and lifecycle
   - Complete invoice structure: items, buyer (with NTN), totals, POS ID
   - Automatic FBR submission on creation
   - Status tracking: PENDING → REGISTERED/FAILED
   - Stores FBR response: QR code, digital signature, correlation ID

5. ✅ **FBR Module**: Accurately simulates FBR API communication patterns
   - Mock FBR service for development/testing
   - Returns proper response format with correlation IDs
   - Ready for production integration with real FBR APIs

**Your implementation is architecturally sound and aligns well with real FBR IRIS processes!** 🎯

---

## Additional Implementation Details

### Invoice Item Structure
Each invoice item includes:
- `description`: String - Item or service description
- `quantity`: Number - Quantity of items
- `price`: Number - Unit price per item
- `taxRate`: Number - Tax rate percentage (for FBR tax calculations)

### Buyer Information Structure
Buyer object includes:
- `name`: String - Buyer's full name
- `ntn`: String - National Tax Number (required for tax compliance in Pakistan)
- `address`: String - Buyer's complete address

### Security & Access Control
- **Authentication**: All invoice endpoints require JWT bearer token
- **Authorization**: Role-based access control (RBAC)
  - Vendors can only access their own invoices
  - Admins can access all vendors and invoices
- **Password Security**: Uses scrypt hashing with salt for secure password storage

### Data Persistence
- Uses MongoDB with Mongoose ODM
- All entities include automatic timestamps (createdAt, updatedAt)
- Invoice numbers are unique per vendor with incremental counters

---

## Future Enhancement Opportunities

1. **POS Management**: Add explicit POS registration and management endpoints
2. **FBR API Keys**: Store FBR-issued API keys on vendor records after approval
3. **Multiple POS Support**: Allow vendors to register multiple POS devices
4. **Digital Certificates**: Add PKI certificate-based authentication support
5. **Invoice Rejection Reasons**: Store detailed FBR rejection reasons
6. **Tax Calculations**: Add automatic tax calculation based on Pakistan tax rules
7. **Real FBR Integration**: Replace mock service with actual FBR API integration

