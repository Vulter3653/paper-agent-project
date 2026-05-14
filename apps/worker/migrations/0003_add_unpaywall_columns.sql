-- Adds Unpaywall open access metadata columns to an existing D1 papers table.
-- Run each ALTER TABLE statement only if the column is missing from:
-- PRAGMA table_info(papers);

ALTER TABLE papers ADD COLUMN oa_pdf_url TEXT;
ALTER TABLE papers ADD COLUMN oa_landing_page_url TEXT;
ALTER TABLE papers ADD COLUMN oa_license TEXT;
ALTER TABLE papers ADD COLUMN oa_host_type TEXT;
ALTER TABLE papers ADD COLUMN oa_repository TEXT;
ALTER TABLE papers ADD COLUMN unpaywall_status TEXT;
ALTER TABLE papers ADD COLUMN unpaywall_reason TEXT;
