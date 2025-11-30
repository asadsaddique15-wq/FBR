# How to Run and Test FBR Digital Invoicing System

## 📋 Prerequisites

Before running the system, ensure you have:

1. **Node.js** (v18 or higher)
   - Check: `node --version`
   - Download: [nodejs.org](https://nodejs.org/)

2. **MongoDB** (v5.0 or higher)
   - Check: `mongod --version`
   - Download: [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud)

3. **npm** (comes with Node.js)
   - Check: `npm --version`

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages (NestJS, MongoDB, JWT, etc.)

---

### Step 2: Configure Environment Variables

The `.env` file should already exist. Verify it contains:

```env
MONGO_URI=mongodb://localhost:27017/fbr-digital-invoicing
PORT=3000
JWT_SECRET=VERY_SECRET_KEY_CHANGE_IN_PRODUCTION
```

If `.env` doesn't exist, create it:
```bash
# Copy the example file
cp .env.example .env
# Or create it manually with the values above
```

---

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if installed as service)
# MongoDB should start automatically

# Or manually start MongoDB service
net start MongoDB

# Or run mongod directly
mongod --dbpath "C:\data\db"
```

**Option B: MongoDB Compass**
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- The database `fbr-digital-invoicing` will be created automatically

**Option C: MongoDB Atlas (Cloud)**
- Update `.env` with your Atlas connection string:
  ```env
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fbr-digital-invoicing
  ```

---

### Step 4: Start the Development Server

```bash
npm run start:dev
```

The server will:
- Compile TypeScript to JavaScript
- Watch for file changes
- Start on `http://localhost:3000`
- Connect to MongoDB
- Create collections automatically

**Expected Output:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] MongooseModule dependencies initialized
...
[Nest] LOG [Nest] Application successfully started on: http://localhost:3000
```

---

### Step 5: Verify Server is Running

Open your browser or use curl:

```bash
# Test FBR ping endpoint
curl http://localhost:3000/v1/fbr/ping

# Or in PowerShell
Invoke-RestMethod -Uri http://localhost:3000/v1/fbr/ping
```

**Expected Response:**
```json
{
  "message": "FBR module is active"
}
```

---

## 🧪 Testing Methods

### Method 1: Automated Test Suite (Recommended)

#### Run the Comprehensive Test Suite

**PowerShell (Windows):**
```powershell
# Run the full test suite with Aurangzeb and Asad data
.\test-full-suite.ps1
```

This will automatically:
- ✅ Create 1 Aurangzeb vendor
- ✅ Create 7 Asad vendors
- ✅ Test all login operations
- ✅ Test registry submissions and approvals
- ✅ Test vendor CRUD operations
- ✅ Create invoices for all vendors
- ✅ Test invoice retrieval
- ✅ Test FBR integration

**What the test does:**
1. Creates test vendors (Aurangzeb + 7 Asad vendors)
2. Tests authentication (login for each vendor)
3. Tests registry operations (submit, approve)
4. Tests vendor CRUD (GET all, GET single, UPDATE)
5. Creates invoices with FBR integration
6. Tests invoice retrieval
7. Tests access control

**Expected Output:**
```
✅ Aurangzeb vendor created!
✅ Asad vendor 1 created...
✅ Login successful!
✅ Invoice created: 6920a496-000001
✅ All tests completed!
```

---

### Method 2: Swagger UI (Interactive Testing)

1. **Open Swagger UI in Browser:**
   ```
   http://localhost:3000/docs
   ```

2. **Authenticate:**
   - Click the **"Authorize"** button (🔒) at the top
   - Enter your JWT token (get it from login endpoint)
   - Click **"Authorize"**

3. **Test Endpoints:**
   - Click on any endpoint to expand it
   - Click **"Try it out"**
   - Fill in the request body (JSON)
   - Click **"Execute"**
   - View the response

**Example: Test Vendor Registration**
1. Expand `POST /v1/vendors/register`
2. Click "Try it out"
3. Paste this JSON:
   ```json
   {
     "displayName": "Test Shop",
     "gstNumber": "GST001",
     "address": "123 Test Street",
     "email": "test@shop.com",
     "contactPhone": "03001234567",
     "password": "Test123!@#",
     "businessType": "GENERAL",
     "role": "USER"
   }
   ```
4. Click "Execute"
5. View the response with vendor ID

---

### Method 3: Manual API Testing with cURL/PowerShell

#### Test 1: Create a Vendor

**PowerShell:**
```powershell
$vendorData = @{
    displayName = "My Test Shop"
    gstNumber = "GST-TEST001"
    address = "123 Test Street"
    email = "mytest@shop.com"
    contactPhone = "03001234567"
    password = "Test123!@#"
    businessType = "GENERAL"
    role = "USER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/v1/vendors/register" `
    -Method POST `
    -Body $vendorData `
    -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:3000/v1/vendors/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "My Test Shop",
    "gstNumber": "GST-TEST001",
    "address": "123 Test Street",
    "email": "mytest@shop.com",
    "contactPhone": "03001234567",
    "password": "Test123!@#",
    "businessType": "GENERAL",
    "role": "USER"
  }'
```

#### Test 2: Login

**PowerShell:**
```powershell
$loginData = @{
    email = "mytest@shop.com"
    password = "Test123!@#"
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "http://localhost:3000/v1/auth/login" `
    -Method POST `
    -Body $loginData `
    -ContentType "application/json"

$token = $auth.accessToken
Write-Host "Token: $token"
```

**cURL:**
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mytest@shop.com",
    "password": "Test123!@#"
  }'
```

#### Test 3: Create an Invoice (Authenticated)

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$invoiceData = @{
    posId = "POS001"
    buyer = @{
        name = "Customer ABC"
        ntn = "NTN123456"
        address = "123 Customer Street"
    }
    items = @(
        @{
            description = "Product X"
            quantity = 2
            price = 5000
            taxRate = 18
        }
    )
    totalAmount = 11800
    currency = "PKR"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/v1/invoices/register" `
    -Method POST `
    -Body $invoiceData `
    -ContentType "application/json" `
    -Headers $headers
```

**cURL:**
```bash
curl -X POST http://localhost:3000/v1/invoices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "posId": "POS001",
    "buyer": {
      "name": "Customer ABC",
      "ntn": "NTN123456",
      "address": "123 Customer Street"
    },
    "items": [
      {
        "description": "Product X",
        "quantity": 2,
        "price": 5000,
        "taxRate": 18
      }
    ],
    "totalAmount": 11800,
    "currency": "PKR"
  }'
```

---

### Method 4: Run Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

---

### Method 5: Run End-to-End Tests

```bash
# Make sure server is running first
npm run start:dev

# In another terminal, run e2e tests
npm run test:e2e
```

---

## 📝 Complete Testing Workflow

### Workflow 1: Full End-to-End Test

1. **Start MongoDB:**
   ```bash
   # Check if MongoDB is running
   # If not, start it
   ```

2. **Start the Server:**
   ```bash
   npm run start:dev
   ```

3. **Run Automated Tests:**
   ```powershell
   .\test-full-suite.ps1
   ```

4. **Verify in MongoDB Compass:**
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Navigate to `fbr-digital-invoicing` database
   - Check collections:
     - `vendors` - Should have 8+ vendors
     - `registries` - Should have 8+ registry records
     - `invoices` - Should have 9+ invoices

5. **Test via Swagger UI:**
   - Open `http://localhost:3000/docs`
   - Test endpoints interactively

---

### Workflow 2: Manual Step-by-Step Test

#### Step 1: Create a Vendor
```powershell
$vendor = @{
    displayName = "Aurangzeb Store"
    gstNumber = "GST-AUR001"
    address = "123 Aurangzeb Street"
    email = "aurangzeb@test.com"
    contactPhone = "03001234567"
    password = "Aurangzeb123!@#"
    businessType = "GENERAL"
    role = "USER"
} | ConvertTo-Json

$vendorResp = Invoke-RestMethod -Uri "http://localhost:3000/v1/vendors/register" `
    -Method POST -Body $vendor -ContentType "application/json"

Write-Host "Vendor Created: $($vendorResp._id)"
$vendorId = $vendorResp._id
```

#### Step 2: Login
```powershell
$login = @{
    email = "aurangzeb@test.com"
    password = "Aurangzeb123!@#"
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "http://localhost:3000/v1/auth/login" `
    -Method POST -Body $login -ContentType "application/json"

$token = $auth.accessToken
Write-Host "Token: $token"
```

#### Step 3: Submit Registry Documents
```powershell
$registry = @{
    vendorId = $vendorId
    documentUrl = "https://example.com/registration.pdf"
    submittedBy = "aurangzeb@test.com"
} | ConvertTo-Json

$regResp = Invoke-RestMethod -Uri "http://localhost:3000/v1/registry/request" `
    -Method POST -Body $registry -ContentType "application/json"

Write-Host "Registry Status: $($regResp.status)"
```

#### Step 4: Approve Registry (Admin)
```powershell
# Login as admin first
$adminLogin = @{
    email = "admin@test.com"
    password = "Admin123!@#"
} | ConvertTo-Json

$adminAuth = Invoke-RestMethod -Uri "http://localhost:3000/v1/auth/login" `
    -Method POST -Body $adminLogin -ContentType "application/json"

# Approve registry
$approved = Invoke-RestMethod -Uri "http://localhost:3000/v1/registry/$vendorId/approve" `
    -Method PATCH

Write-Host "Registry Approved: $($approved.status)"
```

#### Step 5: Create an Invoice
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

$invoice = @{
    posId = "POS001"
    buyer = @{
        name = "Customer ABC"
        ntn = "NTN123456"
        address = "123 Customer Street"
    }
    items = @(
        @{
            description = "Product A"
            quantity = 2
            price = 5000
            taxRate = 18
        }
    )
    totalAmount = 11800
    currency = "PKR"
} | ConvertTo-Json -Depth 10

$invoiceResp = Invoke-RestMethod -Uri "http://localhost:3000/v1/invoices/register" `
    -Method POST -Body $invoice -ContentType "application/json" -Headers $headers

Write-Host "Invoice Created: $($invoiceResp.invoiceNumber)"
Write-Host "Status: $($invoiceResp.status)"
Write-Host "FBR Correlation ID: $($invoiceResp.fbrCorrelationId)"
Write-Host "QR Code: $(if($invoiceResp.qrCode){'Generated'}else{'Not generated'})"
```

#### Step 6: Retrieve Invoices
```powershell
$myInvoices = Invoke-RestMethod -Uri "http://localhost:3000/v1/invoices/mine" `
    -Method GET -Headers $headers

Write-Host "Total Invoices: $($myInvoices.Count)"
foreach ($inv in $myInvoices) {
    Write-Host "Invoice: $($inv.invoiceNumber) - $($inv.status) - $($inv.totalAmount) PKR"
}
```

---

## 🔍 Verifying Test Results

### Check MongoDB Collections

**MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `fbr-digital-invoicing` database
4. Check each collection:
   - **vendors** - Should show all created vendors
   - **registries** - Should show registry submissions
   - **invoices** - Should show all invoices with FBR data

**MongoDB Shell:**
```javascript
// Connect to MongoDB
use fbr-digital-invoicing

// Count documents
db.vendors.countDocuments()
db.registries.countDocuments()
db.invoices.countDocuments()

// View Aurangzeb data
db.vendors.find({ email: /aurangzeb/i })
db.invoices.find({ vendorId: "AURANGZEB_VENDOR_ID" })

// View Asad data
db.vendors.find({ email: /asad/i })
db.invoices.find({ vendorId: { $in: ["ASAD_VENDOR_IDS"] } })
```

---

## 🧪 Test Scenarios Checklist

### ✅ Test All CRUD Operations

#### Vendor Module
- [ ] **CREATE** - Register new vendor
- [ ] **GET** - List all vendors (admin only)
- [ ] **GET** - Get single vendor by ID (admin only)
- [ ] **UPDATE** - Update vendor details (admin only)
- [ ] **DELETE** - Delete vendor (admin only)

#### Auth Module
- [ ] **POST** - Login with valid credentials
- [ ] **POST** - Login with invalid credentials (should fail)
- [ ] **Token** - Use token for authenticated requests
- [ ] **Token** - Invalid token should fail (401)

#### Registry Module
- [ ] **POST** - Submit registry documents
- [ ] **GET** - Check registry status
- [ ] **PATCH** - Approve registry
- [ ] **PATCH** - Reject registry (if endpoint exists)

#### Invoice Module
- [ ] **POST** - Create invoice (authenticated)
- [ ] **POST** - Create invoice without auth (should fail)
- [ ] **GET** - List vendor's own invoices
- [ ] **GET** - Get single invoice by ID (owner/admin only)
- [ ] **GET** - Admin access to vendor invoices

#### FBR Module
- [ ] **GET** - Health check ping
- [ ] **Integration** - Invoice sent to FBR automatically
- [ ] **Response** - FBR returns QR code and signature

---

## 🐛 Troubleshooting

### Issue: Server won't start

**Check MongoDB connection:**
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017

# Or check if MongoDB service is running (Windows)
Get-Service -Name MongoDB*
```

**Check environment variables:**
```bash
# Verify .env file exists and has correct values
cat .env
```

**Check port availability:**
```bash
# Windows - Check if port 3000 is in use
netstat -ano | findstr :3000

# If port is in use, change PORT in .env
```

### Issue: Authentication fails

**Check token:**
- Token must be prefixed with `Bearer `
- Format: `Authorization: Bearer <token>`
- Token must be valid and not expired

**Verify login:**
```powershell
# Test login endpoint
$login = @{ email = "your@email.com"; password = "YourPassword" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/v1/auth/login" `
    -Method POST -Body $login -ContentType "application/json"
```

### Issue: 404 Not Found

**Check endpoint path:**
- All endpoints are prefixed with `/v1`
- Example: `/v1/vendors/register` not `/vendors/register`

**Verify server is running:**
```bash
curl http://localhost:3000/v1/fbr/ping
```

### Issue: MongoDB connection error

**Check MongoDB URI:**
```env
MONGO_URI=mongodb://localhost:27017/fbr-digital-invoicing
```

**Verify MongoDB is accessible:**
```bash
# Test connection
mongosh mongodb://localhost:27017
```

---

## 📊 Expected Test Results

### After Running Full Test Suite

**Database Collections:**
- `vendors`: 8+ documents (1 Aurangzeb + 7 Asad + others)
- `registries`: 8+ documents (all submitted and approved)
- `invoices`: 9+ documents (2 Aurangzeb + 7 Asad)

**Test Output:**
- ✅ All vendors created successfully
- ✅ All logins successful
- ✅ All registries submitted and approved
- ✅ All invoices created with FBR integration
- ✅ All GET operations working
- ✅ All UPDATE operations working
- ✅ Authentication and authorization working

---

## 🎯 Quick Test Commands

### PowerShell Quick Test Script

Save this as `quick-test.ps1`:

```powershell
$baseUrl = "http://localhost:3000/v1"

# 1. Test Server
Write-Host "Testing server..." -ForegroundColor Cyan
$ping = Invoke-RestMethod -Uri "$baseUrl/fbr/ping"
Write-Host "✅ Server is running: $($ping.message)" -ForegroundColor Green

# 2. Create Vendor
Write-Host "Creating vendor..." -ForegroundColor Cyan
$vendor = @{
    displayName = "Quick Test Shop"
    gstNumber = "GST-QUICK"
    address = "123 Test St"
    email = "quicktest@test.com"
    contactPhone = "03001111111"
    password = "Test123!@#"
} | ConvertTo-Json

$v = Invoke-RestMethod -Uri "$baseUrl/vendors/register" -Method POST -Body $vendor -ContentType "application/json"
Write-Host "✅ Vendor created: $($v._id)" -ForegroundColor Green

# 3. Login
Write-Host "Logging in..." -ForegroundColor Cyan
$login = @{ email = "quicktest@test.com"; password = "Test123!@#" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $login -ContentType "application/json"
Write-Host "✅ Login successful!" -ForegroundColor Green

# 4. Create Invoice
Write-Host "Creating invoice..." -ForegroundColor Cyan
$headers = @{ "Authorization" = "Bearer $($auth.accessToken)" }
$invoice = @{
    buyer = @{ name = "Customer"; ntn = "NTN123"; address = "123 St" }
    items = @(@{ description = "Item"; quantity = 1; price = 1000; taxRate = 18 })
    totalAmount = 1180
    currency = "PKR"
} | ConvertTo-Json -Depth 10

$inv = Invoke-RestMethod -Uri "$baseUrl/invoices/register" -Method POST -Body $invoice -ContentType "application/json" -Headers $headers
Write-Host "✅ Invoice created: $($inv.invoiceNumber)" -ForegroundColor Green
Write-Host "✅ Status: $($inv.status), FBR ID: $($inv.fbrCorrelationId)" -ForegroundColor Green

Write-Host "`n✅ All quick tests passed!" -ForegroundColor Green
```

Run it:
```powershell
.\quick-test.ps1
```

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:3000/docs`
- **API Base URL**: `http://localhost:3000/v1`
- **Test Scripts**: 
  - `test-full-suite.ps1` - Comprehensive test with Aurangzeb & Asad data
  - `test-all-endpoints.ps1` - All endpoint tests
- **Documentation**:
  - `README.md` - Project overview
  - `COMPREHENSIVE_TEST_RESULTS.md` - Detailed test results
  - `docs/fbr-iris-alignment.md` - FBR IRIS alignment documentation

---

## 🎉 Success Indicators

Your system is working correctly if:

✅ Server starts without errors
✅ MongoDB connection successful
✅ FBR ping returns `{"message": "FBR module is active"}`
✅ Vendor registration creates records in MongoDB
✅ Login returns JWT token
✅ Invoice creation sends to FBR and gets response
✅ All endpoints respond correctly
✅ Access control works (admin vs user)
✅ Data persists in MongoDB

---

## 🆘 Need Help?

If you encounter issues:

1. **Check server logs** - Look for error messages in terminal
2. **Check MongoDB** - Verify connection and database
3. **Check .env file** - Ensure environment variables are correct
4. **Check Swagger UI** - Test endpoints interactively
5. **Review test results** - Check `COMPREHENSIVE_TEST_RESULTS.md`

---

**Happy Testing! 🚀**

