import docusign from "docusign-esign";
import jwt from "jsonwebtoken";
import Axios from "axios";
import qs from "qs";
import fs from "fs";
import Project from "../models/Project";
import { uploadFileFromStringData } from "./aws";

const privateKey = fs.readFileSync("docusign-app.key");

class DocusignManager {
  constructor() {
    this.accessToken = null;

    this.getAccessToken();
    // Renew every hours
    setInterval(() => {
      this.getAccessToken();
    }, 30 * 10 * 1000);
  }

  init() {
    console.info("Initialization DocusignManager");
  }

  getAccessToken() {
    const that = this;
    const now = Math.ceil(+new Date() / 1000);

    const body = {
      iss: "a53c3fbf-3744-4892-969b-199bfd997073",
      sub: "02942906-bcb6-41b8-b4d3-c1f5fa26ff04",
      iat: now,
      exp: now + 3600,
      aud: "account-d.docusign.com",
      scope: "signature impersonation",
    };

    var token = jwt.sign(body, privateKey, {
      algorithm: "RS256",
    });
    const options = {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: token,
      }),
      url: "https://account-d.docusign.com/oauth/token",
    };
    Axios(options)
      .then(function (result) {
        that.setAccessToken(result.data.access_token);
      })
      .catch(console.error);
  }

  getEnvelope(envelopeId, callback) {
    // GET envelope
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(process.env.DOCUSIGN_BASE_URI + "/restapi");

    apiClient.addDefaultHeader("Authorization", "Bearer " + this.accessToken);

    docusign.Configuration.default.setDefaultApiClient(apiClient);
    var envelopesApi = new docusign.EnvelopesApi();

    envelopesApi.getDocument(
      process.env.DOCUSIGN_API_ACCOUNT_ID,
      envelopeId,
      "combined",
      callback
    );
  }

  setAccessToken(token) {
    console.info(`Refresh Docusign access token: ${token}`);
    this.accessToken = token;
  }

  sendSalesMandate(client, project) {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(process.env.DOCUSIGN_BASE_URI + "/restapi");

    apiClient.addDefaultHeader("Authorization", "Bearer " + this.accessToken);
    docusign.Configuration.default.setDefaultApiClient(apiClient);
    var envelopesApi = new docusign.EnvelopesApi();

    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = "Signature de votre compromis de vente";
    envDef.templateId = process.env.DOCUSIGN_PURCHASE_MANDATE_TEMPLATE_ID;
    envDef.templateRoles = [
      {
        email: client.email,
        name: client.displayName,
        roleName: "client",
      },
    ];
    envDef.status = "sent";

    envelopesApi
      .createEnvelope(process.env.DOCUSIGN_API_ACCOUNT_ID, {
        envelopeDefinition: envDef,
      })
      .then(async (result) => {
        await Project.updateOne(
          { _id: project._id },
          { $set: { mandateEnvelopeId: result.envelopeId } }
        ).exec();
      })
      .catch(console.error);
  }
}

//account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=a53c3fbf-3744-4892-969b-199bfd997073&redirect_uri=http://localhost:3000/

// https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=a53c3fbf-3744-4892-969b-199bfd997073&redirect_uri=http://localhost:3000/docusign-authorization

export default new DocusignManager();
