// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
import fakeData from '@/types/fake.json'
const prisma = new PrismaClient();
const resultType = "EdgeAction"
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let result = {}
  if(!body?.upsert){
    throw createError({
      statusCode: 404,
      statusMessage: `body empty`,
    })

  }else{

    result =  await prisma.edgeAction.upsert({
      where: { id: body.upsert.id ?? "" },
      create: body.upsert,
      update: body.upsert
     })  
  }

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `${resultType} not found`,
    });
  }

  return result;
});