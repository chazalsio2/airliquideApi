import { sendEmail } from "./mailjet";

export function sendWelcomeEmail(user) {
  sendEmail({
    email: user.email,
    name: user.displayName,
    subject: "Bienvenue sur iVision-R",
    textPart: `Bonjour ${user.displayName},\r\n\r\nVotre compte a été créé sur iVision-R, pour y accèder veuillez créer votre mot de passe en cliquant sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/create-password?t=${user.token}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`,
  });
}

export function sendNewClientEmail(client) {
  sendEmail({
    email: process.env.ADMIN_EMAIL,
    name: "Administrateurs iVision-R",
    subject: `Nouveau contact sur iVision-R`,
    textPart: `Bonjour,\r\n\r\nUn nouveau contact a créé sa fiche sur iVision-R.\r\n\r\nNom complet: ${client.firstname} ${client.lastname}\r\nEmail: ${client.email}\r\nTéléphone: ${client.phone}\r\n\r\nPour plus d'information vous pouvez consulter sa fiche client en suivant ce lien :\r\n\r\n${process.env.APP_URL}/clients/${client._id}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`,
  });
}

export function sendProjectWaitingValidationEmail(project) {
  sendEmail({
    email: process.env.ADMIN_EMAIL,
    name: "Administrateurs iVision-R",
    subject: `Affaire en attente de validation`,
    textPart: `Bonjour,\r\n\r\nUne nouvelle  affaire est en attente de validation.\r\n\r\nPour plus d'information vous pouvez consulter l'affaire en cliquant sur ce lien :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`,
  });
}

export function sendAssignProjectNotification(commercial, project) {
  sendEmail({
    email: commercial.email,
    name: commercial.displayName,
    subject: `Assignement sur une nouvelle affaire`,
    textPart: `Bonjour,\r\n\r\nVous avez été affecté en tant que commercial sur une affaire.\r\n\r\nPour voir les détails de l'affaire, veuillez cliquer sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/projects/${project._id}\r\n\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`,
  });
}
