import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    res.send(await (await db.ref('/latestVer').get()).val());
  },
};
