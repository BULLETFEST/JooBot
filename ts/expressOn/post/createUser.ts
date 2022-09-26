import { Request, Response } from 'express';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.email) || IsNullOrEmpty(req.body.email)) {
      res.send({
        status: 400,
        message: 'InvalidForm',
      });
      return;
    }

    const user: UserRecord | void = await global.auth
      .createUser({
        email: req.body.email,
        password: req.body.password,
      })
      .catch((e) => {
        res.send({
          status: 400,
          message: e.message,
        });
      });

    if (user == null) return;

    const t = await GetTokenByUid(user.uid);

    await global.db.ref(`users/${user.uid}/token`).set(t);

    res.send({
      status: 200,
      data: t,
    });
  },
};
