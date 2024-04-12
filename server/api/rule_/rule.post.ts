// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
import fakeData from '@/types/fake.json'
const prisma = new PrismaClient();
const resultType = "Rule"
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if(!body?.upsert){
    throw createError({
      statusCode: 404,
      statusMessage: `body empty`,
    });
  }

  const previousData = fakeData.Rule.complete.find((element, index) => {
    if (element.id == body.upsert.id){
      fakeData.Rule.complete[index] = body.upsert
      return true
    }
  })
  if(typeof previousData == "undefined"){ 
    fakeData.Rule.complete.push(body.upsert)
  }
 
  const result = {}

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `${resultType} not found`,
    });
  }

  return {data: fakeData.Rule};
});