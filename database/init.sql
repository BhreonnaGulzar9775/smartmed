CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Email" VARCHAR(255) UNIQUE NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "FullName" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(50) NOT NULL DEFAULT 'Patient',
    "PhoneNumber" VARCHAR(20),
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Pharmacies" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(255) NOT NULL,
    "RegistrationNumber" VARCHAR(100),
    "Address" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Branches" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "PharmacyId" UUID REFERENCES "Pharmacies"("Id") ON DELETE CASCADE,
    "Name" VARCHAR(255) NOT NULL,
    "Address" TEXT,
    "PhoneNumber" VARCHAR(20),
    "IsActive" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "Medicines" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(255) NOT NULL,
    "GenericName" VARCHAR(255),
    "Description" TEXT,
    "RequiresPrescription" BOOLEAN DEFAULT TRUE,
    "IsColdChain" BOOLEAN DEFAULT FALSE,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Inventory" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "BranchId" UUID REFERENCES "Branches"("Id") ON DELETE CASCADE,
    "MedicineId" UUID REFERENCES "Medicines"("Id") ON DELETE CASCADE,
    "Quantity" INT NOT NULL DEFAULT 0,
    "ParLevel" INT NOT NULL DEFAULT 20,
    "ExpiryDate" DATE,
    "BatchNumber" VARCHAR(100),
    "LastUpdated" TIMESTAMP DEFAULT NOW(),
    UNIQUE("BranchId", "MedicineId", "BatchNumber")
);

CREATE TABLE IF NOT EXISTS "Prescriptions" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "PatientId" UUID REFERENCES "Users"("Id"),
    "PharmacistId" UUID REFERENCES "Users"("Id"),
    "BranchId" UUID REFERENCES "Branches"("Id"),
    "PrescriptionNumber" VARCHAR(100) UNIQUE NOT NULL,
    "Status" VARCHAR(50) DEFAULT 'Pending',
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    "DispensedAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PrescriptionItems" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "PrescriptionId" UUID REFERENCES "Prescriptions"("Id") ON DELETE CASCADE,
    "MedicineId" UUID REFERENCES "Medicines"("Id"),
    "Dosage" VARCHAR(100),
    "Quantity" INT NOT NULL,
    "Instructions" TEXT
);

CREATE TABLE IF NOT EXISTS "AuditLogs" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID REFERENCES "Users"("Id"),
    "Action" VARCHAR(100) NOT NULL,
    "EntityType" VARCHAR(100),
    "EntityId" UUID,
    "Details" JSONB,
    "IpAddress" VARCHAR(45),
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID REFERENCES "Users"("Id"),
    "Type" VARCHAR(50) NOT NULL,
    "Subject" VARCHAR(255),
    "Message" TEXT,
    "Status" VARCHAR(50) DEFAULT 'Pending',
    "SentAt" TIMESTAMP,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

INSERT INTO "Pharmacies" ("Name", "RegistrationNumber", "Address") VALUES
('SmartMed Central', 'PHARM-001', '123 Main St, Johannesburg');

INSERT INTO "Branches" ("PharmacyId", "Name", "Address", "PhoneNumber") VALUES
((SELECT "Id" FROM "Pharmacies" LIMIT 1), 'Johannesburg CBD', '123 Main St, Johannesburg', '+27110000001'),
((SELECT "Id" FROM "Pharmacies" LIMIT 1), 'Sandton', '456 Rivonia Rd, Sandton', '+27110000002');

INSERT INTO "Medicines" ("Name", "GenericName", "RequiresPrescription", "IsColdChain") VALUES
('Panado', 'Paracetamol', FALSE, FALSE),
('Metformin', 'Metformin HCl', TRUE, FALSE),
('Insulin Glargine', 'Insulin Glargine', TRUE, TRUE),
('Amoxil', 'Amoxicillin', TRUE, FALSE);

INSERT INTO "Inventory" ("BranchId", "MedicineId", "Quantity", "ParLevel", "ExpiryDate", "BatchNumber")
SELECT b."Id", m."Id", 100, 20, NOW() + INTERVAL '1 year', 'BATCH-001'
FROM "Branches" b CROSS JOIN "Medicines" m;