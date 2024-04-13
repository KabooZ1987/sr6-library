// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
import fakeData from '@/types/fake.json'
const prisma = new PrismaClient();
const resultType = "Rule"
export default defineEventHandler(async (event) => {

    
    const body = await readBody(event)
    const id = body.id
    if(!id){
        throw createError({
            statusCode: 404,
            statusMessage: `body empty`,
        });
    }


   const result = await prisma.rule.delete({where:{id}})

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `${resultType} not found`,
      });
    }
    
  return result;
});