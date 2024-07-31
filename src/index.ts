import fastify from "fastify";
import setUpRoutes from "./routes/route";
import authMiddleware from "./middlewares/authMiddleware";

const server = fastify();

// set up middleware
server.addHook("preHandler", authMiddleware);

setUpRoutes(server).then(() => {
  console.log("Routes set up successfully");
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
