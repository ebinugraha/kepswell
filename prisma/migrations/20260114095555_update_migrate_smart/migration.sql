/*
  Warnings:

  - You are about to drop the `Karywan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Penilaian` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HRD', 'MANAGER');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('BENEFIT', 'COST');

-- DropForeignKey
ALTER TABLE "Penilaian" DROP CONSTRAINT "Penilaian_karyawanId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'HRD';

-- DropTable
DROP TABLE "Karywan";

-- DropTable
DROP TABLE "Penilaian";

-- CreateTable
CREATE TABLE "Karyawan" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "divisi" "DIVISI" NOT NULL DEFAULT 'HOST_LIVE',
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "jenis" "Type" NOT NULL DEFAULT 'BENEFIT',
    "divisi" "DIVISI" NOT NULL,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaian" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "periodeBulan" INTEGER NOT NULL,
    "periodeTahun" INTEGER NOT NULL,
    "nilaiAkhir" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skor_penilaian" (
    "id" TEXT NOT NULL,
    "penilaianId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "skor_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Karyawan_nip_key" ON "Karyawan"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "penilaian_karyawanId_periodeBulan_periodeTahun_key" ON "penilaian"("karyawanId", "periodeBulan", "periodeTahun");

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skor_penilaian" ADD CONSTRAINT "skor_penilaian_penilaianId_fkey" FOREIGN KEY ("penilaianId") REFERENCES "penilaian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skor_penilaian" ADD CONSTRAINT "skor_penilaian_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
