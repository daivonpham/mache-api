export default () => ({
  env: process.env.NODE_ENV || "development",
  host: process.env.HOST || "localhost",
  port: parseInt(process.env.PORT || "3000", 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    db: process.env.DB,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    expiresRefreshIn: process.env.JWT_EXPIRES_REFRESH_IN,
    saltRounds: parseInt(process.env.JWT_SALT_ROUNDS || "10", 10),
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || "NestJS API",
    description:
      process.env.SWAGGER_DESCRIPTION || "NestJS Swagger Documentation",
    version: process.env.SWAGGER_VERSION || "1.0",
  },
  upload: {
    dir: process.env.UPLOAD_DIR || "storages/uploads",
  },
});
