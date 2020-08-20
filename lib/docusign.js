import docusign from "docusign-esign";

export async function listDocumentInEnvelope() {
  // instantiate a new EnvelopesApi object
  var envelopesApi = new docusign.EnvelopesApi();

  console.log("listDocumentInEnvelope -> envelopesApi", envelopesApi);

  // call the listDocuments() API
  envelopesApi.listDocuments(
    process.env.DOCUSIGN_API_ACCOUNT_ID,
    "envelopeId",
    null,
    (error, docsList, response) => {
      console.log("listDocumentInEnvelope -> error, docsList", error, docsList);
      if (error) {
        console.log("Error: " + error);
        return;
      }
      if (docsList) {
        console.log("Envelope Documents: " + JSON.stringify(docsList));
      }
    }
  );
}

export async function listAllEnvelopes() {
  var envelopesApi = new docusign.EnvelopesApi();

  const results = await envelopesApi.listStatusChanges(
    process.env.DOCUSIGN_API_ACCOUNT_ID
  );
  console.log("listAllEnvelopes -> results", results);
}

function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName
  // args.templateId

  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.templateId = args.templateId;

  // Create template role elements to connect the signer and cc recipients
  // to the template
  // We're setting the parameters via the object creation
  let signer1 = docusign.TemplateRole.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    roleName: "signer",
  });

  // Create a cc template role.
  // We're setting the parameters via setters
  let cc1 = new docusign.TemplateRole();
  cc1.email = args.ccEmail;
  cc1.name = args.ccName;
  cc1.roleName = "cc";

  // Add the TemplateRole objects to the envelope object
  env.templateRoles = [signer1, cc1];
  env.status = "sent"; // We want the envelope to be sent

  return env;
}
