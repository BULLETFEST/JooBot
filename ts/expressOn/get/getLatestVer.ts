import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    res.send({
      status: 200,
      data: await (await db.ref('/latestVer').get()).val(),
    });
  },
};
