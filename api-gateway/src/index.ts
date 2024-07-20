import fastify from "fastify";
import fastifyHttpProxy from '@fastify/http-proxy';
import {connect, NatsConnection, StringCodec} from "nats"

const server = fastify({logger: true});

async function start() {
    const nc: NatsConnection = await connect({servers: "nats://localhost:4222/"});
    const sc = StringCodec();

    server.register(fastifyHttpProxy, {
        upstream: "http://users-service:3001",
        prefix: "/auth",
         rewritePrefix: ''
    });

    server.get('/company', async (request, reply) => {
        try {
          const response = await nc.request('getCompany', sc.encode('Request from gateway'));
          const data = sc.decode(response.data);
          reply.send(data);
        } catch (err) {
          server.log.error(err);
          reply.status(500).send({ error: 'Error communicating with microservice' });
        }
      });
    
      server.post('/company', async (request, reply) => {
        try {
            const payload = request.body;

            console.log('*******************');
            console.log(payload);
            console.log('*******************');
 
            const response = await nc.request('createCompany', sc.encode(JSON.stringify(payload)));
            const data = sc.decode(response.data); 
            reply.send(data);
        } catch (err) {
          server.log.error(err);
          reply.status(500).send({ error: 'Error communicating with microservice' });
        }
      });
    
      server.delete('/company', async (request, reply) => {
        try {
          const response = await nc.request('deleteCompany', sc.encode('Request from gateway'));
          const data = sc.decode(response.data);
          reply.send(data);
        } catch (err) {
          server.log.error(err);
          reply.status(500).send({ error: 'Error communicating with microservice' });
        }
      });

    server.register(fastifyHttpProxy, {
        upstream:"http://127.0.0.1:3003",
        prefix: "/product",
        rewritePrefix: ''
    })

    server.get("/", async (request, reply) => {
        reply.send({hello: "the gateway is working"});
    })

    try {
        await server.listen(3000);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

start();