import { Client } from '../models'

export async function getClient(clientId) {
  const client = await Client.findById(clientId)

  return client
}
