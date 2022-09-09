import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.code) || req.body.code.match(/\D/)) {
      res.send({
        code: '',
        success: false,
        message: 'Invalid room code!',
      });
      return;
    }
    let data = await db.ref(`/${req.body.code}`).get();

    if (!data.exists()) {
      res.send({
        code: '',
        success: false,
        message: 'This lobby does not exist!',
      });
      return;
    }

    let val = await data.val();

    res.send({
      code: val.address,
      success: true,
      message: '',
    });
  },
};
