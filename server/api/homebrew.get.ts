// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const resultType = "EdgeBoost"
export default defineEventHandler(async (event) => {
//   const {  } = event.context.params;
  const result = {}

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `${resultType} not found`,
    });
  }

  return result;
});