/*
  Warnings:

  - You are about to drop the column `stripeSubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subStatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeSubId",
DROP COLUMN "subStatus",
ADD COLUMN     "paidUntil" TIMESTAMP(3);
