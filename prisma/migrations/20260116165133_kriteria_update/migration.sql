/*
  Warnings:

  - You are about to drop the column `kriteriaId` on the `skor_penilaian` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "skor_penilaian" DROP CONSTRAINT "skor_penilaian_kriteriaId_fkey";

-- AlterTable
ALTER TABLE "skor_penilaian" DROP COLUMN "kriteriaId";
