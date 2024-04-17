-- CreateEnum
CREATE TYPE "attribute" AS ENUM ('body', 'agility', 'reflex', 'strength', 'willpower', 'logic', 'intuition', 'charisma', 'magic', 'resonance', 'edge', 'essence');

-- CreateEnum
CREATE TYPE "skill" AS ENUM ('astral', 'athletics', 'biotech', 'close_combat', 'con', 'conjuring', 'cracking', 'electronics', 'enchanting', 'engineering', 'firearms', 'influence', 'outdoors', 'perception', 'piloting', 'sorcery', 'stealth', 'tasking', 'exotic_weapons', 'other');

-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('minor', 'major', 'free', 'whole_round');

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "action_type" NOT NULL,
    "homebrew" BOOLEAN NOT NULL,
    "attribute" "attribute",
    "skill" "skill",
    "description" TEXT NOT NULL,
    "source" "source_book",
    "page" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Action_id_key" ON "Action"("id");
