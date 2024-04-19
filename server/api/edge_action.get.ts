// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resultType = "EdgeAction"
export default defineEventHandler(async (event) => {

  const result = await prisma.edgeAction.findMany({})

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `${resultType} not found`,
    });
  }

  return result;
});