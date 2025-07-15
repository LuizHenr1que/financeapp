-- Alteração do modelo Card para novo formato solicitado
-- Remove o campo color, adiciona icon, closingDay, dueDay
-- closingDay e dueDay como inteiros (dias do mês)

ALTER TABLE "cards"
DROP COLUMN IF EXISTS "color";

ALTER TABLE "cards"
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "closingDay" INTEGER,
ADD COLUMN     "dueDay" INTEGER;

-- Opcional: Remover campos antigos se existirem
-- ALTER TABLE "cards" DROP COLUMN IF EXISTS "brand";
-- ALTER TABLE "cards" DROP COLUMN IF EXISTS "lastFour";
