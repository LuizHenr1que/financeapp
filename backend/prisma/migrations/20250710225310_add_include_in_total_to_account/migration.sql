/*
  Warnings:

  - You are about to drop the `logo_banks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "includeInTotal" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "logo_banks";
