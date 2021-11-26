import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
        societe:{
          type: String
        },
        client_vision_r:{
          type: String
        },
        adresse:{
          type: String
        },
        Mail:{
          type: String
        },
        phone:{
          type: String
        },
        date_lieu:{
          type: String
        },
        cp_ville:{
          type: String
        },
        nationalite:{
          type: String
        },
        profession:{
          type: String
        },
        regime_matrimonial:{
          type: String
        },
        contactClientId: {
          type: mongoose.Types.ObjectId

        },
        tel_n_a: {
          type: String
        },
        adresse_n_a:{
          type: String
        },
        mail_n_a: {
          type: String
        },
        societe1_a: {
          type: String
        },
        societe2_a: {
          type: String
        },
        nom1_a: {
          type: String
        },
        nom2_a: {
          type: String
        },
        prenom1_a:{ 
          type: String
        },
        prenom2_a: {
          type: String
        },
        adresse1_a: {
          type: String
        },
        adresse2_a: {
          type: String
        },
        mail1_c: {
          type: String
        },
        mail2_c: {
          type: String
        },
        cp_ville1_a: {
          type: String
        },
        cp_ville2_a: {
          type: String
        },
        date_lieu_naissance1_a: {
          type: String
        },
        date_lieu_naissance2_a: {
          type: String
        },
        nationalite1_a: {
          type: String
        },
        nationalite2_a: {
          type: String
        },
        profession1_a: {
          type: String
        },
        profession2_a: {
          type: String
        },
        regime_matrimonial1_a: {
          type: String
        },
        regime_matrimonial2_a: {
          type: String
        },
        date_regime1_a: {
          type: String
        },
        date_regime2_a: {
          type: String
        },
        tel1_a: {
          type: String
        },
        tel2_a: {
          type: String
        },
        mail1_a: {
          type: String
        },
        mail2_a: {
          type: String
        },
        res_fiscale1_a: {
          type: String
        },
        res_fiscale2_a: {
          type: String
        },
        contactId: {
          type: mongoose.Types.ObjectId
        },
        propertiesId:{
          type: mongoose.Types.ObjectId

        }, code_postal_properties:{
          type: String
        },
        ref_cadastrales_properties:{
          type: String
        },
        prix_net_properties:{
          type: String
        },
        mobilier_p_properties:{
          type: String
        },
        honoraires_vision_r_properties:{
          type: String
        },
        charge_vision_r_properties:{
          type: String
        },
        charge_vision_r_properties:{
          type: String
        },
        honoraires_properties:{
          type: String
        },
        charge_properties:{
          type: String
        },
        frais_notaires_properties:{
          type: String
        },
        montant_depot_garantie_properties:{
          type: String
        },
        type_acquisition_properties:{
          type: String
        },
        banque_properties:{
          type: String
        },
        montant_properties:{
          type: String
        },
        taux_properties:{
          type: String
        },
        duree_properties:{
          type: String
        },
        occupation_properties:{
          type: String
        },
        Substitution_properties:{
          type: String
        },
        num_mandat_properties:{
          type: String
        },
        date_mandat_properties:{
          type: String
        },
        mandant_properties:{
          type: String
        },
        conseiller_properties:{
          type: String
        },
        tel_conseiller_properties:{
          type: String
        },
        email_conseiller_properties:{
          type: String
        },
        carte_conseiller_properties:{
          type: String
        }
  },
  
  {
    timestamps: true,
    collection: "dossierNotaires"
  }
);

export default mongoose.model("DossierNotaire", schema);
