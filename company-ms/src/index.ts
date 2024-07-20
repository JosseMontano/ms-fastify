import Fastify from "fastify";
import { connect, NatsConnection, StringCodec, Subscription } from "nats";

async function main() {
  const nc: NatsConnection = await connect({
    servers: "nats://localhost:4222",
  });
  const sc = StringCodec();

  const handleGetCompany = (msg: any) => {
    msg.respond(
      sc.encode(
        JSON.stringify({ service: "Microservice 1", action: "getCompany" })
      )
    );
  };

  const handleCreateCompany = (msg: any) => {
    const payload = JSON.parse(sc.decode(msg.data));
    console.log("Create Company with data:", payload);
    msg.respond(
      sc.encode(
        JSON.stringify({
          service: "Microservice 1",
          action: "createCompany",
          data: payload,
        })
      )
    );
  };

  const handleDeleteCompany = (msg: any) => {
    msg.respond(
      sc.encode(
        JSON.stringify({ service: "Microservice 1", action: "deleteCompany" })
      )
    );
  };

  const subscriptions: { [key: string]: Subscription } = {
    getCompany: nc.subscribe("getCompany", {
      callback: (err, msg) => {
        if (err) console.error(err);
        else handleGetCompany(msg);
      },
    }),
    createCompany: nc.subscribe("createCompany", {
      callback: (err, msg) => {
        if (err) console.error(err);
        else handleCreateCompany(msg);
      },
    }),
    deleteCompany: nc.subscribe("deleteCompany", {
      callback: (err, msg) => {
        if (err) console.error(err);
        else handleDeleteCompany(msg);
      },
    }),
  };

  console.log(
    "Microservice listening on NATS topics: getCompany, createCompany, deleteCompany"
  );

  process.on("SIGINT", () => {
    Object.values(subscriptions).forEach((sub) => sub.unsubscribe());
    nc.close();
  });
}

main().catch((err) => {
  console.error("Error in main function:", err);
});
