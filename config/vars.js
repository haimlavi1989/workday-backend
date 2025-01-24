module.exports = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    dbUri: process.env.DATABASE
    .replace('<USERNAME>', process.env.DATABASE_USERNAME)
    .replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
    emailFrom: process.env.EMAIL_FROM,
    emailUser: process.env.EMAIL_USERNAME,
    jwtExpInSeconds: process.env.JWT_EXPIRES_IN_SECONDS,
    jwtSecret: process.env.JWT_SECRET,
}