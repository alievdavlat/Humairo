import type { Request, Response } from "express";

export const auth  = {
  login: async (req: Request, res: Response) => {
    const body  = req.body;

    if(!body.username) {
      return res.status(400).send({data:null, message:'usrname is empty'})
    }
  }
}