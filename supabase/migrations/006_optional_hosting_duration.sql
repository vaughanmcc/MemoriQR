-- Migration: Allow NULL hosting_duration for partner codes
-- Partners can request codes without specifying duration upfront
-- Customer selects duration at activation time

-- Update code_batches to allow NULL hosting_duration
ALTER TABLE code_batches 
  DROP CONSTRAINT IF EXISTS code_batches_hosting_duration_check,
  ALTER COLUMN hosting_duration DROP NOT NULL;

-- Add new constraint that allows NULL or valid values
ALTER TABLE code_batches 
  ADD CONSTRAINT code_batches_hosting_duration_check 
  CHECK (hosting_duration IS NULL OR hosting_duration IN (5, 10, 25));

-- Update retail_activation_codes to allow NULL hosting_duration  
ALTER TABLE retail_activation_codes
  DROP CONSTRAINT IF EXISTS retail_activation_codes_hosting_duration_check;

-- The column already allows NULL, just need to update the check constraint
ALTER TABLE retail_activation_codes
  ADD CONSTRAINT retail_activation_codes_hosting_duration_check
  CHECK (hosting_duration IS NULL OR hosting_duration IN (5, 10, 25));

-- Update the trigger function to handle NULL hosting_duration
-- Commission will be calculated when customer activates and selects duration
CREATE OR REPLACE FUNCTION update_commission_on_activation()
RETURNS TRIGGER AS $$
DECLARE
  v_partner_id UUID;
  v_batch_id UUID;
  v_commission_rate DECIMAL(5,2);
  v_retail_price INTEGER;
  v_commission_amount INTEGER;
BEGIN
  -- Only process when status changes to 'used'
  IF NEW.status = 'used' AND (OLD.status IS NULL OR OLD.status != 'used') THEN
    -- Get batch and partner info
    SELECT batch_id INTO v_batch_id FROM retail_activation_codes WHERE id = NEW.id;
    
    IF v_batch_id IS NOT NULL THEN
      SELECT cb.partner_id, p.commission_rate 
      INTO v_partner_id, v_commission_rate
      FROM code_batches cb
      JOIN partners p ON cb.partner_id = p.id
      WHERE cb.id = v_batch_id;
      
      IF v_partner_id IS NOT NULL AND NEW.hosting_duration IS NOT NULL THEN
        -- Calculate retail price based on product type and hosting duration
        v_retail_price := CASE 
          WHEN NEW.product_type = 'qr_code' THEN
            CASE NEW.hosting_duration WHEN 5 THEN 99 WHEN 10 THEN 149 WHEN 25 THEN 199 END
          WHEN NEW.product_type = 'qr_medallion' THEN
            CASE NEW.hosting_duration WHEN 5 THEN 149 WHEN 10 THEN 199 WHEN 25 THEN 279 END
          WHEN NEW.product_type = 'qr_plaque' THEN
            CASE NEW.hosting_duration WHEN 5 THEN 199 WHEN 10 THEN 249 WHEN 25 THEN 349 END
        END;
        
        v_commission_amount := (v_retail_price * v_commission_rate / 100)::INTEGER;
        
        -- Insert or update commission record
        INSERT INTO partner_commissions (partner_id, batch_id, code_id, activation_code, retail_price, commission_rate, commission_amount)
        VALUES (v_partner_id, v_batch_id, NEW.id, NEW.activation_code, v_retail_price, v_commission_rate, v_commission_amount)
        ON CONFLICT (code_id) DO UPDATE SET
          retail_price = EXCLUDED.retail_price,
          commission_amount = EXCLUDED.commission_amount;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN code_batches.hosting_duration IS 'Hosting duration in years. NULL means customer selects at activation.';
COMMENT ON COLUMN retail_activation_codes.hosting_duration IS 'Hosting duration in years. Inherited from batch if set, otherwise selected at activation.';
