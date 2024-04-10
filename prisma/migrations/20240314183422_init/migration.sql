-- CreateEnum
CREATE TYPE "source_book" AS ENUM ('core', 'wyrd', 'wild_life', 'firing_squad', 'companion', 'body_shop', 'shifter', 'homebrew');

-- CreateEnum
CREATE TYPE "edge_action_restriction" AS ENUM ('melee_attack', 'ranged_attack', 'any_attack', 'any', 'specific', 'block', 'ranged_attack_from_cover', 'use_skill', 'multi_attack');

-- CreateEnum
CREATE TYPE "rule_category" AS ENUM ('edge', 'magic', 'combat', 'decking', 'rigging', 'regeneration', 'critter', 'spirits', 'other');

-- CreateTable
CREATE TABLE "EdgeBoost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "source" "source_book" NOT NULL,
    "page" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EdgeBoost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdgeAction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "restriction" "edge_action_restriction" NOT NULL,
    "description" TEXT NOT NULL,
    "source" "source_book" NOT NULL,
    "page" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EdgeAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "category" "rule_category" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "homebrew" BOOLEAN NOT NULL DEFAULT false,
    "source" "source_book",
    "page" INTEGER,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homebrew" (
    "id" TEXT NOT NULL,
    "category" "rule_category" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homebrew_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EdgeBoost_id_key" ON "EdgeBoost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EdgeAction_id_key" ON "EdgeAction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_id_key" ON "Rule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Homebrew_id_key" ON "Homebrew"("id");
