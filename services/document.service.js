import { Document } from "../models";

export async function getDocument(documentId) {
  const document = await Document.findById(documentId)
  return document;
}
