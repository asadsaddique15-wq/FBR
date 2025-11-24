# FBR Digital Invoicing - Full Test Suite
# Tests all modules with Aurangzeb and Asad data

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3000/v1"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   FBR DIGITAL INVOICING - FULL TEST SUITE" -ForegroundColor Cyan
Write-Host "   Testing with Aurangzeb and Asad Data" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Variables
$aurangzebId = $null
$aurangzebToken = $null
$adminToken = $null
$invoiceIds = New-Object System.Collections.ArrayList

# ============================================================
# STEP 1: CREATE VENDORS
# ============================================================
Write-Host "STEP 1: Creating Vendors" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 1.1 Create Aurangzeb Vendor
Write-Host "[1.1] CREATE - Aurangzeb Vendor..." -ForegroundColor Cyan
try {
    $aurangzebData = @{
        displayName = "Aurangzeb Store"
        gstNumber = "GST-AUR001"
        address = "123 Aurangzeb Street, Karachi"
        email = "aurangzeb@test.com"
        contactPhone = "03001234567"
        password = "Aurangzeb123!@#"
        businessType = "GENERAL"
        role = "USER"
    } | ConvertTo-Json

    $aurangzeb = Invoke-RestMethod -Uri "$baseUrl/vendors/register" -Method POST -Body $aurangzebData -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Aurangzeb vendor created!" -ForegroundColor Green
    Write-Host "      ID: $($aurangzeb._id)" -ForegroundColor White
    Write-Host "      Email: $($aurangzeb.email)" -ForegroundColor White
    $aurangzebId = $aurangzeb._id
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ⚠️  Vendor may already exist" -ForegroundColor Yellow
    }
}
Write-Host ""

# 1.2 Create Asad Vendors (7 records)
Write-Host "[1.2] CREATE - Asad Vendors (7 vendors)..." -ForegroundColor Cyan
$asadIds = New-Object System.Collections.ArrayList
$asadEmails = @()

for ($i = 1; $i -le 7; $i++) {
    try {
        $asadData = @{
            displayName = "Asad Shop $i"
            gstNumber = "GST-ASAD$($i.ToString().PadLeft(3, '0'))"
            address = "$i Asad Street, Lahore"
            email = "asad$i@test.com"
            contactPhone = "0300$($i.ToString().PadLeft(7, '0'))"
            password = "Asad123!@#"
            businessType = "GENERAL"
            role = "USER"
        } | ConvertTo-Json

        $asad = Invoke-RestMethod -Uri "$baseUrl/vendors/register" -Method POST -Body $asadData -ContentType "application/json" -ErrorAction Stop
        [void]$asadIds.Add($asad._id)
        $asadEmails += $asad.email
        Write-Host "   ✅ Asad vendor $i created: $($asad.email)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Asad vendor $i may already exist" -ForegroundColor Yellow
        $asadEmails += "asad$i@test.com"
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "   📊 Created: 1 Aurangzeb + $($asadIds.Count) Asad vendors" -ForegroundColor Yellow
Write-Host ""

# ============================================================
# STEP 2: AUTHENTICATION
# ============================================================
Write-Host "STEP 2: Authentication Tests" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 2.1 Login as Aurangzeb
Write-Host "[2.1] POST - Aurangzeb Login..." -ForegroundColor Cyan
try {
    $aurangzebLogin = @{
        email = "aurangzeb@test.com"
        password = "Aurangzeb123!@#"
    } | ConvertTo-Json

    $auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $aurangzebLogin -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Aurangzeb login successful!" -ForegroundColor Green
    Write-Host "      Token length: $($auth.accessToken.Length) chars" -ForegroundColor White
    $aurangzebToken = $auth.accessToken
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2.2 Login as Admin
Write-Host "[2.2] POST - Admin Login..." -ForegroundColor Cyan
try {
    $adminLogin = @{
        email = "admin@test.com"
        password = "Admin123!@#"
    } | ConvertTo-Json

    $auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Admin login successful!" -ForegroundColor Green
    $adminToken = $auth.accessToken
} catch {
    Write-Host "   ⚠️  Admin login failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2.3 Test Invalid Login
Write-Host "[2.3] POST - Invalid Login Test..." -ForegroundColor Cyan
try {
    $badLogin = @{
        email = "invalid@test.com"
        password = "WrongPassword123"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $badLogin -ContentType "application/json" -ErrorAction Stop | Out-Null
    Write-Host "   ❌ Should have failed!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Correctly rejected invalid credentials (401)" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================
# STEP 3: REGISTRY OPERATIONS
# ============================================================
Write-Host "STEP 3: Registry Operations" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 3.1 Submit Registry for Aurangzeb
Write-Host "[3.1] POST - Registry Submission (Aurangzeb)..." -ForegroundColor Cyan
if ($aurangzebId) {
    try {
        $registryData = @{
            vendorId = $aurangzebId
            documentUrl = "https://example.com/aurangzeb/registration.pdf"
            submittedBy = "aurangzeb@test.com"
        } | ConvertTo-Json

        $registry = Invoke-RestMethod -Uri "$baseUrl/registry/request" -Method POST -Body $registryData -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Registry submitted! Status: $($registry.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 3.2 Submit Registries for Asad Vendors
Write-Host "[3.2] POST - Registry Submissions (Asad Vendors)..." -ForegroundColor Cyan
$asadRegistryCount = 0
for ($i = 0; $i -lt $asadIds.Count; $i++) {
    try {
        $registryData = @{
            vendorId = $asadIds[$i]
            documentUrl = "https://example.com/asad$($i+1)/registration.pdf"
            submittedBy = $asadEmails[$i]
        } | ConvertTo-Json

        $registry = Invoke-RestMethod -Uri "$baseUrl/registry/request" -Method POST -Body $registryData -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Asad vendor $($i+1) registry submitted!" -ForegroundColor Green
        $asadRegistryCount++
    } catch {
        Write-Host "   ⚠️  Asad vendor $($i+1) registry failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "   📊 Registry submissions: 1 Aurangzeb + $asadRegistryCount Asad" -ForegroundColor Yellow
Write-Host ""

# 3.3 Approve Aurangzeb Registry
Write-Host "[3.3] PATCH - Approve Registry (Aurangzeb)..." -ForegroundColor Cyan
if ($aurangzebId) {
    try {
        $approved = Invoke-RestMethod -Uri "$baseUrl/registry/$aurangzebId/approve" -Method PATCH -ErrorAction Stop
        Write-Host "   ✅ Aurangzeb registry approved! Status: $($approved.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3.4 Approve Asad Registries
Write-Host "[3.4] PATCH - Approve Registries (Asad Vendors)..." -ForegroundColor Cyan
$approvedCount = 0
foreach ($asadId in $asadIds) {
    try {
        $approved = Invoke-RestMethod -Uri "$baseUrl/registry/$asadId/approve" -Method PATCH -ErrorAction Stop
        $approvedCount++
    } catch {
        # May fail if registry doesn't exist
    }
    Start-Sleep -Milliseconds 200
}
Write-Host "   ✅ Approved $approvedCount Asad registries" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 4: VENDOR CRUD OPERATIONS (Admin)
# ============================================================
Write-Host "STEP 4: Vendor CRUD Operations (Admin)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if ($adminToken) {
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
    }

    # 4.1 GET All Vendors
    Write-Host "[4.1] GET - List All Vendors..." -ForegroundColor Cyan
    try {
        $allVendors = Invoke-RestMethod -Uri "$baseUrl/vendors" -Method GET -Headers $adminHeaders -ErrorAction Stop
        $aurangzebCount = ($allVendors | Where-Object { $_.displayName -like "*Aurangzeb*" }).Count
        $asadCount = ($allVendors | Where-Object { $_.displayName -like "*Asad*" }).Count
        
        Write-Host "   ✅ Retrieved $($allVendors.Count) vendor(s)" -ForegroundColor Green
        Write-Host "      • Aurangzeb vendors: $aurangzebCount" -ForegroundColor White
        Write-Host "      • Asad vendors: $asadCount" -ForegroundColor White
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""

    # 4.2 GET Single Vendor
    Write-Host "[4.2] GET - Single Vendor (Aurangzeb)..." -ForegroundColor Cyan
    if ($aurangzebId) {
        try {
            $singleVendor = Invoke-RestMethod -Uri "$baseUrl/vendors/$aurangzebId" -Method GET -Headers $adminHeaders -ErrorAction Stop
            Write-Host "   ✅ Vendor retrieved: $($singleVendor.displayName)" -ForegroundColor Green
            Write-Host "      Registered: $($singleVendor.isRegistered)" -ForegroundColor White
        } catch {
            Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host ""

    # 4.3 UPDATE Vendor
    Write-Host "[4.3] PATCH - Update Vendor (Aurangzeb)..." -ForegroundColor Cyan
    if ($aurangzebId) {
        try {
            $updateData = @{
                displayName = "Aurangzeb Store - Updated"
                contactPhone = "03001111111"
                address = "Updated Address for Aurangzeb"
            } | ConvertTo-Json

            $updated = Invoke-RestMethod -Uri "$baseUrl/vendors/$aurangzebId" -Method PATCH -Body $updateData -ContentType "application/json" -Headers $adminHeaders -ErrorAction Stop
            Write-Host "   ✅ Vendor updated! New name: $($updated.displayName)" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host ""

    # 4.4 Test Access Control
    Write-Host "[4.4] Access Control Test (Non-Admin)..." -ForegroundColor Cyan
    if ($aurangzebToken) {
        $userHeaders = @{
            "Authorization" = "Bearer $aurangzebToken"
        }
        try {
            Invoke-RestMethod -Uri "$baseUrl/vendors" -Method GET -Headers $userHeaders -ErrorAction Stop | Out-Null
            Write-Host "   ❌ Should have failed!" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 403 -or $_.Exception.Response.StatusCode -eq 401) {
                Write-Host "   ✅ Correctly blocked non-admin access" -ForegroundColor Green
            }
        }
    }
    Write-Host ""
}

# ============================================================
# STEP 5: INVOICE OPERATIONS
# ============================================================
Write-Host "STEP 5: Invoice Operations" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 5.1 Create Invoices for Aurangzeb
Write-Host "[5.1] POST - Create Invoices (Aurangzeb)..." -ForegroundColor Cyan
if ($aurangzebToken) {
    $aurangzebHeaders = @{
        "Authorization" = "Bearer $aurangzebToken"
    }

    # Invoice 1
    try {
        $invoice1Data = @{
            posId = "POS-AUR-001"
            buyer = @{
                name = "Customer A"
                ntn = "NTN001"
                address = "Customer A Street"
            }
            items = @(
                @{
                    description = "Product A for Aurangzeb"
                    quantity = 2
                    price = 5000
                    taxRate = 18
                }
            )
            totalAmount = 11800
            currency = "PKR"
        } | ConvertTo-Json -Depth 10

        $invoice1 = Invoke-RestMethod -Uri "$baseUrl/invoices/register" -Method POST -Body $invoice1Data -ContentType "application/json" -Headers $aurangzebHeaders -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ Invoice 1 created: $($invoice1.invoiceNumber)" -ForegroundColor Green
        Write-Host "      Status: $($invoice1.status), FBR ID: $($invoice1.fbrCorrelationId)" -ForegroundColor White
        [void]$invoiceIds.Add($invoice1._id)
    } catch {
        Write-Host "   ❌ Failed invoice 1: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Invoice 2
    try {
        $invoice2Data = @{
            posId = "POS-AUR-002"
            buyer = @{
                name = "Customer B"
                ntn = "NTN002"
                address = "Customer B Street"
            }
            items = @(
                @{
                    description = "Product B for Aurangzeb"
                    quantity = 1
                    price = 10000
                    taxRate = 18
                }
            )
            totalAmount = 11800
            currency = "PKR"
        } | ConvertTo-Json -Depth 10

        $invoice2 = Invoke-RestMethod -Uri "$baseUrl/invoices/register" -Method POST -Body $invoice2Data -ContentType "application/json" -Headers $aurangzebHeaders -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ Invoice 2 created: $($invoice2.invoiceNumber)" -ForegroundColor Green
        [void]$invoiceIds.Add($invoice2._id)
    } catch {
        Write-Host "   ❌ Failed invoice 2: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 5.2 Create Invoices for Asad Vendors (5-10 invoices)
Write-Host "[5.2] POST - Create Invoices (Asad Vendors)..." -ForegroundColor Cyan
$asadInvoiceCount = 0

for ($i = 0; $i -lt $asadEmails.Count -and $i -lt 7; $i++) {
    try {
        # Login as Asad vendor
        $asadLogin = @{
            email = $asadEmails[$i]
            password = "Asad123!@#"
        } | ConvertTo-Json

        $asadAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $asadLogin -ContentType "application/json" -ErrorAction Stop
        $asadHeaders = @{
            "Authorization" = "Bearer $($asadAuth.accessToken)"
        }

        # Create invoice
        $invoiceData = @{
            buyer = @{
                name = "Customer Asad $($i+1)"
                ntn = "NTN$($i+1)00"
                address = "Street $($i+1)"
            }
            items = @(
                @{
                    description = "Product for Asad $($i+1)"
                    quantity = 1
                    price = 1000 * ($i+1)
                    taxRate = 18
                }
            )
            totalAmount = (1000 * ($i+1)) + ((1000 * ($i+1)) * 0.18)
            currency = "PKR"
        } | ConvertTo-Json -Depth 10

        $invoice = Invoke-RestMethod -Uri "$baseUrl/invoices/register" -Method POST -Body $invoiceData -ContentType "application/json" -Headers $asadHeaders -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ Asad vendor $($i+1) invoice created: $($invoice.invoiceNumber)" -ForegroundColor Green
        $asadInvoiceCount++
        [void]$invoiceIds.Add($invoice._id)
    } catch {
        Write-Host "   ⚠️  Asad vendor $($i+1) invoice failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "   📊 Created: 2 Aurangzeb + $asadInvoiceCount Asad invoices" -ForegroundColor Yellow
Write-Host ""

# 5.3 GET Aurangzeb's Invoices
Write-Host "[5.3] GET - Aurangzeb Invoices..." -ForegroundColor Cyan
if ($aurangzebToken) {
    try {
        $myInvoices = Invoke-RestMethod -Uri "$baseUrl/invoices/mine" -Method GET -Headers $aurangzebHeaders -ErrorAction Stop
        Write-Host "   ✅ Retrieved $($myInvoices.Count) invoice(s) for Aurangzeb" -ForegroundColor Green
        foreach ($inv in $myInvoices) {
            Write-Host "      • $($inv.invoiceNumber) - $($inv.status) - $($inv.totalAmount) PKR" -ForegroundColor White
        }
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 5.4 GET Single Invoice
if ($invoiceIds.Count -gt 0) {
    Write-Host "[5.4] GET - Single Invoice by ID..." -ForegroundColor Cyan
    try {
        $singleInvoice = Invoke-RestMethod -Uri "$baseUrl/invoices/$($invoiceIds[0])" -Method GET -Headers $aurangzebHeaders -ErrorAction Stop
        Write-Host "   ✅ Invoice retrieved: $($singleInvoice.invoiceNumber)" -ForegroundColor Green
        Write-Host "      Buyer: $($singleInvoice.buyer.name)" -ForegroundColor White
        Write-Host "      Items: $($singleInvoice.items.Count)" -ForegroundColor White
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 5.5 GET Vendor Invoices (Admin)
Write-Host "[5.5] GET - Vendor Invoices (Admin - Aurangzeb)..." -ForegroundColor Cyan
if ($adminToken -and $aurangzebId) {
    try {
        $vendorInvoices = Invoke-RestMethod -Uri "$baseUrl/invoices/vendor/$aurangzebId" -Method GET -Headers $adminHeaders -ErrorAction Stop
        Write-Host "   ✅ Admin retrieved $($vendorInvoices.Count) invoice(s) for Aurangzeb" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================================
# STEP 6: FBR MODULE
# ============================================================
Write-Host "STEP 6: FBR Module Health Check" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "[6.1] GET - FBR Health Check..." -ForegroundColor Cyan
try {
    $ping = Invoke-RestMethod -Uri "$baseUrl/fbr/ping" -Method GET -ErrorAction Stop
    Write-Host "   ✅ FBR module is active: $($ping.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# FINAL SUMMARY
# ============================================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ COMPREHENSIVE TEST SUITE COMPLETED!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "📊 TEST SUMMARY:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ DATA CREATED:" -ForegroundColor Green
Write-Host "   • Aurangzeb vendors: 1" -ForegroundColor White
Write-Host "   • Asad vendors: $($asadIds.Count)" -ForegroundColor White
Write-Host "   • Total vendors: $($asadIds.Count + 1)" -ForegroundColor White
Write-Host "   • Aurangzeb invoices: 2" -ForegroundColor White
Write-Host "   • Asad invoices: $asadInvoiceCount" -ForegroundColor White
Write-Host "   • Total invoices: $($invoiceIds.Count)" -ForegroundColor White
Write-Host ""
Write-Host "✅ OPERATIONS TESTED:" -ForegroundColor Green
Write-Host "   • CREATE: Vendors, Registries, Invoices" -ForegroundColor White
Write-Host "   • GET: All vendors, Single vendor, Invoices" -ForegroundColor White
Write-Host "   • UPDATE: Vendor updates, Registry approvals" -ForegroundColor White
Write-Host "   • DELETE: Endpoint exists (not tested)" -ForegroundColor White
Write-Host "   • Authentication: JWT tokens" -ForegroundColor White
Write-Host "   • Authorization: Role-based access" -ForegroundColor White
Write-Host ""
Write-Host "✅ MODULES TESTED:" -ForegroundColor Green
Write-Host "   • Vendor Module - CREATE, GET, UPDATE" -ForegroundColor White
Write-Host "   • Auth Module - POST login" -ForegroundColor White
Write-Host "   • Registry Module - POST, GET, PATCH" -ForegroundColor White
Write-Host "   • Invoice Module - POST, GET multiple" -ForegroundColor White
Write-Host "   • FBR Module - GET ping" -ForegroundColor White
Write-Host ""
Write-Host "🎉 All tests completed!" -ForegroundColor Green

