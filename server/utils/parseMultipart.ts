import formidable from 'formidable';

export async function parseMultipart(event: H3Event<EventHandlerRequest>): Promise<{ status: any, fields: any; files: any; }>|Promise<{ status: any; message: any; }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(event.node.req, (err:any, fields:any, files:any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({status:"ok", fields, files });
    });
    resolve({ status:"error",message:"parse didn't work" });
  });
}
