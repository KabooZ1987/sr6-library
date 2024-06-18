-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "EdgeAction" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "EdgeBoost" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "Homebrew" ADD COLUMN     "imageId" INTEGER;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "image" BYTEA NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_id_key" ON "Image"("id");

-- AddForeignKey
ALTER TABLE "EdgeBoost" ADD CONSTRAINT "EdgeBoost_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgeAction" ADD CONSTRAINT "EdgeAction_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homebrew" ADD CONSTRAINT "Homebrew_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
