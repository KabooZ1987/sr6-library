// server/api/course/chapter/[chapterSlug]/lesson/[lessonSlug].get.ts

import { PrismaClient } from '@prisma/client';
import formidable  from 'formidable';
import { parseMultipart } from '~/server/utils/parseMultipart';

const prisma = new PrismaClient();
const resultType = "Action"
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let result = {}
  // parseMultipart(event).then(resolve => {
  //   if(resolve.status == "error"){
  //     throw createError({
  //       statusCode: 500,
  //       statusMessage: resolve.message,
  //     })
  //   }
  //   console.log(resolve.fields);
  //   console.log(resolve.files);
  // })
  
  
//   TODO: implement image behaviour
  if(!body){
    throw createError({
      statusCode: 404,
      statusMessage: `body empty`,
    })

  }else{

    // result =  await prisma.action.upsert({
    //   where: { id: body.upsert.id ?? "" },
    //   create: body.upsert,
    //   update: body.upsert
    //  })  
  }

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `${resultType} not found`,
    });
  }

  return result;
});