// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
import fakeData from '@/types/fake.json'
const prisma = new PrismaClient();
const resultType = "EdgeAction"
export default defineEventHandler(async (event) => {

    
    const body = await readBody(event)
    
    if(!body?.upsert){
        throw createError({
            statusCode: 404,
            statusMessage: `body empty`,
        });
    }


    fakeData.EdgeAction.complete.find((element, index) => {
        if (element.id == body.upsert.id){
          fakeData.EdgeAction.complete.splice(index,1)
          return true
        }
    })

    const result = {}

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `${resultType} not found`,
      });
    }
    
  return {data: fakeData.EdgeAction};
});