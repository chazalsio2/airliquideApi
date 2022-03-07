import { Client,DossierNotaire } from '../models'

export async function getClient(clientId) {
  const client = await Client.findById(clientId)

  return client
}
export async function getDossierNotaire(dossiernotaireId) {
  const dossiernotaire = await DossierNotaire.findById(dossiernotaireId)

  return dossiernotaire
}
