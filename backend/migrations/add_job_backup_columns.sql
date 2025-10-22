-- =====================================================
-- ADD JOB BACKUP COLUMNS TO APPLICATIONS TABLE
-- Preserves job titles and departments even when jobs are deleted
-- =====================================================

-- Add backup columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS job_title_backup TEXT,
ADD COLUMN IF NOT EXISTS job_department_backup TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_applications_job_backup 
ON applications(job_title_backup);

-- Populate existing applications with job backup data
UPDATE applications 
SET 
    job_title_backup = jobs.title,
    job_department_backup = jobs.department
FROM jobs 
WHERE applications.job_id = jobs.id 
AND applications.job_title_backup IS NULL;

-- Add helpful comments
COMMENT ON COLUMN applications.job_title_backup IS 'Backup copy of job title for historical preservation';
COMMENT ON COLUMN applications.job_department_backup IS 'Backup copy of job department for historical preservation';

-- Log the update
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count 
    FROM applications 
    WHERE job_title_backup IS NOT NULL;
    
    RAISE NOTICE 'Job backup migration completed. Updated % applications with job backup data.', updated_count;
END $$;
