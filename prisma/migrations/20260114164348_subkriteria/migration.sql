-- CreateTable
CREATE TABLE "sub_kriteria" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sub_kriteria_kriteriaId_idx" ON "sub_kriteria"("kriteriaId");

-- AddForeignKey
ALTER TABLE "sub_kriteria" ADD CONSTRAINT "sub_kriteria_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
