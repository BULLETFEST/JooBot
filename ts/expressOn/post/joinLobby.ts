import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.code) || req.body.code.match(/\D/)) {
      res.send({
        status: 400,
        message: 'InvalidForm',
      });
      return;
    }
    let data = await db.ref(`/lobbies/${req.body.code}`).get();

    if (!data.exists()) {
      res.send({
        status: 404,
        message: 'This lobby does not exist!',
      });
      return;
    }

    let val = await data.val();

    res.send({
      status: 200,
      message: '',
      data: val.address,
    });
  },
};
