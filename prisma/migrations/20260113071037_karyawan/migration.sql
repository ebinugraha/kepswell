-- CreateTable
CREATE TABLE "Karywan" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Karywan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Karywan_nip_key" ON "Karywan"("nip");
