/*
  Warnings:

  - The `divisi` column on the `Karywan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DIVISI" AS ENUM ('MARKETING', 'HOST_LIVE', 'PRODUKSI', 'ADMIN');

-- AlterTable
ALTER TABLE "Karywan" DROP COLUMN "divisi",
ADD COLUMN     "divisi" "DIVISI" NOT NULL DEFAULT 'HOST_LIVE';
