const database = require('../../models');
const jwt = require('jsonwebtoken');

const userLogin = database.login;
const user = database.user;
const tenant = database.tenant;

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);

  const refreshToken = cookies.refreshToken;

  const foundUser = await userLogin.findOne({
    where: {
      refreshToken: refreshToken,
    },
  });
  if (!foundUser) {
    return res.sendStatus(403);
  }

  const userInfo = await user.findOne({
    where: {
      id: foundUser.userId,
    },
  });

  const tenantInfo = await tenant.findOne({
    where: {
      userId: foundUser.userId,
    },
  });

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET_KEY,
    (err, decoded) => {
      if (err || foundUser.userId !== decoded.userId)
        return res.sendStatus(403);
      const accessToken = jwt.sign(
        { email: decoded.email, userId: decoded.userId },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: '10m' }
      );
      res.json({
        email: userInfo.email,
        name: userInfo.fullName,
        createdAt : userInfo.createdAt,
        userId: userInfo.id,
        userPhoto: userInfo.photo,
        isTenant: userInfo.isTenant,
        tenantId: tenantInfo?.id || '',
        accessToken,
      });
    }
  );
};

module.exports = { handleRefreshToken };
