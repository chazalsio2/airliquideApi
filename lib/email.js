import { sendEmail, sendEmailWithTemplate } from "./mailjet";
import Client from "../models/Client";

export function sendWelcomeEmail(user) {
  sendEmail({
    email: user.email,
    name: user.displayName,
    subject: "Bienvenue sur iVision-R",
    textPart: `Bonjour ${user.displayName},\r\n\r\nVotre compte a été créé sur iVision-R, pour y accèder veuillez créer votre mot de passe en cliquant sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/create-password?t=${user.token}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  });
}

export function sendNewClientEmail(client) {
  // sendEmail({
  //   email: process.env.ADMIN_EMAIL,
  //   name: "Administrateurs iVision-R",
  //   subject: `Nouveau contact sur iVision-R`,
  //   textPart: `Bonjour,\r\n\r\nUn nouveau contact a créé sa fiche sur iVision-R.\r\n\r\nNom complet: ${client.firstname} ${client.lastname}\r\nEmail: ${client.email}\r\nTéléphone: ${client.phone}\r\n\r\nPour plus d'information vous pouvez consulter sa fiche client en suivant ce lien :\r\n\r\n${process.env.APP_URL}/clients/${client._id}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  // });
}

export function sendProjectWaitingValidationEmail(project) {
  // sendEmail({
  //   email: process.env.ADMIN_EMAIL,
  //   name: "Administrateurs iVision-R",
  //   subject: `Affaire en attente de validation`,
  //   textPart: `Bonjour,\r\n\r\nUne nouvelle  affaire est en attente de validation.\r\n\r\nPour plus d'information vous pouvez consulter l'affaire en cliquant sur ce lien :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  // });
}

export function sendAssignProjectNotification(commercial, project) {
  sendEmail({
    email: commercial.email,
    name: commercial.displayName,
    subject: `Assignement sur une nouvelle affaire`,
    textPart: `Bonjour,\r\n\r\nVous avez été affecté en tant que commercial sur une affaire.\r\n\r\nPour voir les détails de l'affaire, veuillez cliquer sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  });
}

export function sendAgreementWaitingValidation(project) {
  // sendEmail({
  //   email: process.env.ADMIN_EMAIL,
  //   name: "Administrateurs iVision-R",
  //   subject: `Compromis de vente en attente de validation`,
  //   textPart: `Bonjour,\r\n\r\nUn nouveau compromis de vente est en attente de validation.\r\n\r\nPour voir les détails du compromis, veuillez cliquer sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  // });
}

export function sendPurchaseOfferWaitingValidation(project) {
  // sendEmail({
  //   email: process.env.ADMIN_EMAIL,
  //   name: "Administrateurs iVision-R",
  //   subject: `Offre d'achat en attente de validation`,
  //   textPart: `Bonjour,\r\n\r\nUne offre d'achat est en attente de validation.\r\n\r\nPour voir les détails de l'offre d'achat, veuillez cliquer sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  // });
}

export function sendLoanOfferWaitingValidation(project) {
  // sendEmail({
  //   email: process.env.ADMIN_EMAIL,
  //   name: "Administrateurs iVision-R",
  //   subject: `Offre de prêt en attente de validation`,
  //   textPart: `Bonjour,\r\n\r\nUne offre de prêt est en attente de validation.\r\n\r\nPour voir les détails de l'offre de prêt, veuillez cliquer sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  // });
}

export function sendDeedWaitingValidation(project) {
  // sendEmail({
  //   email: process.env.ADMIN_EMAIL,
  //   name: "Administrateurs iVision-R",
  //   subject: `Acte authentique de vente en attente de validation`,
  //   textPart: `Bonjour,\r\n\r\nUn nouvel acte authentique de vente est en attente de validation.\r\n\r\nPour voir les détails de l'acte authentique, veuillez cliquer sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  // });
}

export async function sendMandateSignatureConfirmation(client) {
  sendEmailWithTemplate({
    templateId: 1646869,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Vous êtes au début d'une expérience VISION-R."
  });
}

export async function sendAcceptPurchaseOfferConfirmation(client) {
  sendEmailWithTemplate({
    templateId: 1646933,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Négociation réussi... mais encore ?"
  });
}

export async function sendAcceptSalesAgreementConfirmation(client) {
  sendEmailWithTemplate({
    templateId: 1647087,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Compromis signé! YES!"
  });
}

export async function sendAcceptLoanOfferConfirmation(client) {
  sendEmailWithTemplate({
    templateId: 1647135,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Bientôt le grand jour!"
  });
}

export async function sendMandateSignedForSalesProject(client) {
  sendEmailWithTemplate({
    templateId: 1770124,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject:
      "Vous êtes au début d'une expérience VISION-R pour la vente de votre bien"
  });
}

export async function sendPurchaseOfferAcceptedForSalesProject(client) {
  sendEmailWithTemplate({
    templateId: 1770126,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Offre d'achat validée, bravo à vous... mais encore ?"
  });
}

export async function sendSalesAgreementAcceptedForSalesProject(client) {
  sendEmailWithTemplate({
    templateId: 1770128,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Compromis signé! YES!"
  });
}

export async function sendLoanOfferAcceptedForSalesProject(client) {
  sendEmailWithTemplate({
    templateId: 1770129,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject: "Bientôt le grand jour, signature de l'acte authentique !"
  });
}

export async function sendDeedAcceptedForSalesProject(client) {
  sendEmailWithTemplate({
    templateId: 1770130,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "a@a.a",
    ccCommerciaux: "a@a.a",
    subject:
      "Ensemble, nous sommes arrivés au bout de votre projet de vente! Encore toutes nos félicitations !"
  });
}
//5
export async function sendAcceptSalesDeedConfirmation(client, commercial) {
  sendEmailWithTemplate({
    templateId: 1647143,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "direction@vision-r.re",
    ccCommerciaux: commercial.email,
    subject:
      "Toutes mes félicitations pour cette acquisition, bientôt le début des travaux !"
  });
}

export async function sendProductionConfirmation(client, commercial) {
  sendEmailWithTemplate({
    templateId: 1647166,
    variables: {
      firstname: client.firstname
    },
    email: client.email,
    name: client.displayName,
    ccVision: "direction@vision-r.re",
    ccCommerciaux: commercial.email,
    subject: "Ensemble, nous sommes arrivés au bout de votre projet immobilier!"
  });
}

export async function sendClientReminder(project) {
  const client = await Client.findById(project.clientId).lean();
  sendEmail({
    email: client.email,
    name: client.displayName,
    subject: "Courage ! Vous y êtes presque...",
    textPart: `Bonjour,\r\n\r\nVotre fiche Vision-R n'est toujours pas complété.\r\n\r\nVeuillez cliquer sur le lien ci-dessous pour pouvoir le faire :\r\n\r\n${process.env.APP_URL}/votre-projet/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  });
}

export async function sendMatchPropertiesEmail(project, matchProperties) {
  const client = await Client.findById(project.clientId).lean();
  const res = matchProperties
    .map(
      (p) =>
        `${p.name} :\r\n${process.env.APP_URL}/nos-biens-immobiliers/${p.id}\r\n\r\n`
    )
    .join();
  sendEmail({
    email: client.email,
    name: client.displayName,
    subject:
      matchProperties.length > 1
        ? `${matchProperties.length} biens semblent correspondre à votre recherche`
        : `${matchProperties.length} bien semble correspondre à votre recherche`,
    textPart: `Bonjour,\r\n\r\n Nous avons enregistré ${matchProperties.length} biens pouvant vous intéresser :\r\n\r\n${res}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  });
}

export async function sendNewPropertyMatch(project, property) {
  const client = await Client.findById(project.clientId).lean();
  sendEmail({
    email: client.email,
    name: client.displayName,
    subject: `Une nouveau bien correspondant à votre recherche`,
    textPart: `Bonjour,\r\n\r\nNous avons enregistré 1 nouveau bien correspondant à votre recherche :\r\n\r\n${property.name}:\r\n${process.env.APP_URL}/biens-immobiliers/${property.id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`
  });
}
