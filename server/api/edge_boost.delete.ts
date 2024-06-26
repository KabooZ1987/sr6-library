// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resultType = "EdgeBoost"
export default defineEventHandler(async (event) => {

    
    const body = await readBody(event)
    const id = body.id
    if(!id){
        throw createError({
            statusCode: 404,
            statusMessage: `id empty`,
        });
    }

   const result = await prisma.edgeBoost.delete({where:{id}})

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `${resultType} not found`,
      });
    }
    
  return result;
});