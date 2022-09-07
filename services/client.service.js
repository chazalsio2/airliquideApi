import { Client,DossierNotaire,Insul_r } from '../models'

export async function getClient(clientId) {
  const client = (await Client.findById(clientId)||await Insul_r.findById(clientId))

  return client
}
export async function getDossierNotaire(dossiernotaireId) {
  const dossiernotaire = await DossierNotaire.findById(dossiernotaireId)

  return dossiernotaire
}
