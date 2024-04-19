// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resultType = "EdgeAction"
export default defineEventHandler(async (event) => {

    
    const body = await readBody(event)
    const id = body.id
    if(!id){
        throw createError({
            statusCode: 404,
            statusMessage: `body empty`,
        });
    }


   const result = await prisma.edgeAction.delete({where:{id}})

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `${resultType} not found`,
      });
    }
    
  return result;
});