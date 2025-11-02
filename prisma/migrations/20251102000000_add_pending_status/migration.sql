-- AlterEnum
-- Add PENDING to BookingStatus enum if it doesn't already exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'PENDING' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BookingStatus')
  ) THEN
    ALTER TYPE "BookingStatus" ADD VALUE 'PENDING' BEFORE 'CONFIRMED';
  END IF;
END $$;

