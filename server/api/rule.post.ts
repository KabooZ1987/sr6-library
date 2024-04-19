// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resultType = "Rule"
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let result = {}
  if(!body?.upsert){
    throw createError({
      statusCode: 404,
      statusMessage: `body empty`,
    })

  }else{

    result =  await prisma.rule.upsert({
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