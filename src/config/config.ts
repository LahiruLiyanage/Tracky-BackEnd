export default () => ({
  jwt: process.env.JWT_SECRET,
  databaseUrl: {
    connectionString: process.env.DATABASE_URL,
  },
});
