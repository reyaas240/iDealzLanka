/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `BankTransfer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BankTransfer_transactionId_key" ON "BankTransfer"("transactionId");
