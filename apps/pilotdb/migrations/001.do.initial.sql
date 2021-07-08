CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS "Pilots" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "firstAndMiddleName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "name" TEXT GENERATED ALWAYS AS (TRIM(COALESCE("firstAndMiddleName", '') || ' ' || COALESCE("lastName", ''))) STORED,
  "street1" TEXT,
  "street2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zipcode" TEXT,
  "country" TEXT,
  "region" TEXT,
  "medicalClass" SMALLINT NOT NULL DEFAULT 0,
  "medicalIssuedDate" DATE,
  "medicalExpiryDate" DATE
);

-- CREATE INDEX IF NOT EXISTS "IDX_PILOT_ID" ON "Pilots" USING GIN("id" GIN_TRGM_OPS);
-- CREATE INDEX IF NOT EXISTS "IDX_PILOT_FIRST_AND_MIDDLE_NAME" ON "Pilots" USING GIN("firstAndMiddleName" GIN_TRGM_OPS);
-- CREATE INDEX IF NOT EXISTS "IDX_PILOT_LAST_NAME" ON "Pilots" USING GIN("lastName" GIN_TRGM_OPS);
CREATE INDEX IF NOT EXISTS "IDX_PILOT_NAME" ON "Pilots" USING GIN("name" GIN_TRGM_OPS);
CREATE INDEX IF NOT EXISTS "IDX_PILOT_MEDICAL_CLASS" ON "Pilots" ("medicalClass");

CREATE OR REPLACE FUNCTION "FnTrimPilots"()
  RETURNS trigger AS $$
DECLARE
BEGIN
  NEW."lastName" = BTRIM(NEW."lastName");
  NEW."firstAndMiddleName" = BTRIM(NEW."firstAndMiddleName");
  NEW."street1" = BTRIM(NEW."street1");
  NEW."street2" = BTRIM(NEW."street2");
  NEW."city" = BTRIM(NEW."city");
  NEW."state" = BTRIM(NEW."state");
  NEW."zipcode" = BTRIM(NEW."zipcode");
  NEW."country" = BTRIM(NEW."country");
  NEW."region" = BTRIM(NEW."region");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "TRIG_TRIM_BEFORE_INSERT_PILOT" ON "Pilots";
CREATE TRIGGER "TRIG_TRIM_BEFORE_INSERT_PILOT"
BEFORE INSERT OR UPDATE ON "Pilots"
  FOR EACH ROW
EXECUTE PROCEDURE "FnTrimPilots"();
