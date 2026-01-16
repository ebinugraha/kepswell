/*
  Warnings:

  - Added the required column `subKriteriaId` to the `skor_penilaian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "skor_penilaian" ADD COLUMN     "subKriteriaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "skor_penilaian" ADD CONSTRAINT "skor_penilaian_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "sub_kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
