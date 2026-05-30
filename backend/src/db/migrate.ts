const run = async () => {
  console.log('MongoDB uses Mongoose schemas; no SQL migration required.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
