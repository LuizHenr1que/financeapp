-- Adiciona a coluna accountId na tabela cards para vincular o cartão a uma conta de pagamento
-- Passo 1: Adiciona a coluna accountId permitindo NULL temporariamente
ALTER TABLE "cards" ADD COLUMN "accountId" TEXT;

-- Adiciona a foreign key para garantir integridade referencial

ALTER TABLE "cards" ADD CONSTRAINT "cards_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


