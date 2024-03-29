import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.token)) {
      res.send({
        status: 400,
        message: 'InvalidForm',
      });
      return;
    }

    const [valid, user] = await ValidateToken(req.body.token);

    res.send({
      status: 200,
      message: '',
      data: valid,
    });
  },
};

