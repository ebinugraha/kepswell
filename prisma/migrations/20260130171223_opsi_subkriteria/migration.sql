-- CreateTable
CREATE TABLE "opsi_sub_kriteria" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "skor" DOUBLE PRECISION NOT NULL,
    "subKriteriaId" TEXT NOT NULL,

    CONSTRAINT "opsi_sub_kriteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "opsi_sub_kriteria" ADD CONSTRAINT "opsi_sub_kriteria_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "sub_kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
