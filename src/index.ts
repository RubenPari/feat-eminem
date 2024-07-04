import fastify from "fastify";
import setUpRoutes from "./routes/route";

const server = fastify();

setUpRoutes(server).then(() => {
  console.log("Routes set up successfully");
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
