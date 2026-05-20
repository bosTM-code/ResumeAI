import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createResumeServer } from "./server";

let clientInstance: Client | null = null;

export async function getMcpClient(): Promise<Client> {
  if (clientInstance) return clientInstance;

  const server = createResumeServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({ name: "resume-ai-client", version: "1.0.0" });

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  clientInstance = client;
  return client;
}
