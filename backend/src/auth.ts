

export const auth  = {
  login: async (req, res) => {
    const body  = req.body;

    if(!body.username) {
      return res.status(400).send({data:null, message:'usrname is empty'})
    }
  }
}