// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
import fakeData from '@/types/fake.json'
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

  return fakeData.Rule.complete;
});