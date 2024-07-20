import Fastify from 'fastify';
import { connect, NatsConnection } from 'nats';

const fastify = Fastify({ logger: true });

async function main() {
  const nc: NatsConnection = await connect({ servers: 'localhost:4222' });

  fastify.get('/', async (request, reply) => {
    reply.send({ service: 'Microservice 2' });
  });

  try {
    await fastify.listen(3003);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();