// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resultType = "EdgeBoost"
export default defineEventHandler(async (event) => {

  const result = await prisma.edgeBoost.findMany({})

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `${resultType} not found`,
    });
  }

  return result;
});