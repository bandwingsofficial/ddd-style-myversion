-- CreateIndex
CREATE INDEX "Order_customerId_outletId_status_idx" ON "Order"("customerId", "outletId", "status");
