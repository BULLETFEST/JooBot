import { Request, Response } from 'express';
import { UserCredential } from 'firebase/auth';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.email) || IsNullOrEmpty(req.body.password)) {
      res.send({
        status: 400,
        message: 'InvalidForm',
      });
      return;
    }

    global.clientAuth.setPersistence(global.clientAuth.getAuth(), global.clientAuth.browserLocalPersistence);

    const user: UserCredential | null = await global.clientAuth
      .signInWithEmailAndPassword(global.clientAuth.getAuth(), req.body.email, req.body.password)
      .catch((e) => {
        res.send({
          status: 400,
          message: e.message,
        });

        return null;
      });

    if (user == null) return;

    res.send({
      status: 200,
      data: await user?.user.getIdToken(),
    });
  },
};
