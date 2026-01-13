-- CreateTable
CREATE TABLE "Penilaian" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "kualitas" DOUBLE PRECISION NOT NULL,
    "kuantitas" DOUBLE PRECISION NOT NULL,
    "kedisiplinan" DOUBLE PRECISION NOT NULL,
    "sikap" DOUBLE PRECISION NOT NULL,
    "skor" DOUBLE PRECISION,
    "periode" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penilaian_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karywan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
