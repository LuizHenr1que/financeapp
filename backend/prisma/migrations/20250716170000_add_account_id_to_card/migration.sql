-- Adiciona a coluna accountId na tabela cards para vincular o cartão a uma conta de pagamento
ALTER TABLE "cards" ADD COLUMN "accountId" TEXT NOT NULL; 

-- Adiciona a foreign key para garantir integridade referencial
ALTER TABLE "cards" ADD CONSTRAINT "cards_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
