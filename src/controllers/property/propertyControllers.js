const database = require('../../models');
const property = database.property;

module.exports = {
  getById: async (req, res) => {
    try {
      const response = await property.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: database.room,
            include: [
              {
                model: database.image,
              },
            ],
          },
        ],
      });
      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
};
