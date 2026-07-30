ALTER TABLE "StockTransaction"
  ADD COLUMN "previousQuantity" DECIMAL(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN "newQuantity" DECIMAL(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN "quantityChange" DECIMAL(12, 3) NOT NULL DEFAULT 0;

UPDATE "StockTransaction"
SET
  "previousQuantity" = CASE
    WHEN "type" = 'INITIALIZE' THEN 0
    WHEN "type" = 'TRANSFER' THEN "quantity"
    ELSE 0
  END,
  "newQuantity" = CASE
    WHEN "type" = 'INITIALIZE' THEN "quantity"
    WHEN "type" = 'ADD' THEN "quantity"
    WHEN "type" = 'TRANSFER' THEN 0
    WHEN "type" = 'ADJUST' THEN "quantity"
    ELSE "quantity"
  END,
  "quantityChange" = CASE
    WHEN "type" = 'INITIALIZE' THEN "quantity"
    WHEN "type" = 'ADD' THEN "quantity"
    WHEN "type" = 'TRANSFER' THEN -"quantity"
    ELSE 0
  END;
