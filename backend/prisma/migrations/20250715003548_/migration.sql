/*
  Warnings:

  - You are about to drop the column `brand` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `lastFour` on the `cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cards" DROP COLUMN "brand",
DROP COLUMN "lastFour";
