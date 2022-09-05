import { Request, Response } from 'express';
import fb from 'firebase-admin';

const db = fb.database();

export default {
  run: async function (req: Request, res: Response) {
    let exists = true;

    if (IsNullOrEmpty(req.body.address) || IsNullOrEmpty(req.body.userId)) {
      res.send({
        code: '',
        success: false,
        message:
          'There has been an error with your client, please wait a moment and try again. If the problem persists try restarting your client.',
      });
      return;
    }

    let generatedId;

    let t = await db.ref('/').orderByChild('userId').equalTo(req.body.userId).get();

    let tVal = await t.val();
    if (tVal != null) {
      for (let key of Object.keys(tVal)) {
        await db.ref(`/${key}`).set(null);
      }
    }
    while (exists) {
      generatedId = Math.floor(Math.random() * (9999 - 1000) + 1000);

      let ref = await db.ref(`/${generatedId}`).get();

      exists = ref.exists();
    }

    await db.ref(`/${generatedId}`).set({
      address: req.body.address,
      userId: req.body.userId,
      time: Date.now(),
      type: req.body.type || 'public',
      playerCount: '1',
      gameMode: 'Elimination',
    });

    res.send({
      code: generatedId,
      success: true,
      message: '',
    });
  },
};
