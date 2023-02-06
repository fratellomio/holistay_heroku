const database = require('../../models');
const userLogin = database.login;

const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204);
  const refreshToken = cookies.refreshToken;

  const foundUser = await userLogin.findOne({
    where: {
      refreshToken: refreshToken,
    },
  });

  if (!foundUser) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    return res.sendStatus(204);
  }

  await userLogin.destroy({
    where: {
      refreshToken: refreshToken,
    },
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  res.sendStatus(204);
};

module.exports = { handleLogout };
