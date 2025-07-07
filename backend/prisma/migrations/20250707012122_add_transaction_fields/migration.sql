-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "cardId" TEXT,
ADD COLUMN     "currentInstallment" INTEGER,
ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "launchType" TEXT NOT NULL DEFAULT 'unico',
ADD COLUMN     "parentTransactionId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "recurrenceType" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "valorComoParcela" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
