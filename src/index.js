const express = require('express');
// This package automatically parses JSON requests.
const bodyParser = require('body-parser');
// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');

const {authenticate} = require('./authentication');
const buildDataloaders = require('./dataloaders');
const schema = require('./schema');

const connectMongo = require('./mongo-connector');

const start = async () => {
  const mongo = await connectMongo();
  var app = express();

  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo,
        user
      }, // This context object is passed to all resolvers.
      schema,
    };
  };
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-maria.bello@vtex.com'`,
  }));

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
};

// 5
start();
