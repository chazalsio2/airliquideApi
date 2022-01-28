import mongoose from "mongoose";


const monObjet = ["Carnet_d'entretien_de_l'immeuble"]//,"Dossier_de_diagnostic_technique", "Lettre_d'intention_d'achat", "Statuts_de_la_SCI","Convention,Dossier_de_diagnostic_technique","Dernier_de_taxes","liste_détaillée_et_chiffrée","3_derniers_PV_d","Diagnostic_technique_global","Reglement_de_copropriété","Carte_d'identité","Baux"];
/*var monTableau = Object.keys(monObjet).map(function(cle) {
    return [Number(cle), monObjet[cle]];
});*/

/* const piece_transmise = new mongoose.Schema({
 pieces_transmises : {
    type: String,
    enum:monObjet
  }
})
*/
var schema = new mongoose.Schema(
  {
        societe1_v:{
          type: String
        },
        Honoraires_Vendeur_properties:{
          type: String
        },
        honoraires_Acquéreur_properties:{
          type: String
        },
        charge_Acquéreur_properties:{
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
        cp_ville1_conj:{
          type: String
        },
        nationalite_conj:{
          type: String
        },
        date_lieu_naissance1_conj:{
          type: String
        },
        Adress_conj:{
          type: String
        },
        societe_conj:{
          type: String
        },
        res_conj:{
          type: String
        },
        projectId:{
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
        etat_occupation_b:{
          type: String
        },
        societe2_:{
          type: String
        },
        societe2_a:{
          type: String
        },
        nom2_:{
          type: String
        },
        prenom2_:{
          type: String
        },
        adresse2_:{
          type: String
        },
        profession2_:{
          type: String
        },
        autre_condition:{
          type: String
        },
        Prix_de_vente_FAI:{
          type: String
        },
        date_lieu_naissance2_:{
          type: String
        },
        nationalite2_:{
          type: String
        },
        mail2_:{
          type: String
        },
        cp_ville2_:{
          type: String
        },
        num_tel2_:{
          type: String
        },
        profession1_conj:{
          type: String
        },
        lieux_naissance_conj:{
          type: String
        },
        regime_matrimonial1_a: {
          type: String
        },
        regime_matrimonial2_a: {
          type: String
        },
        lieux_naissance:{
          type: String
        },
        date_regime_matrimonial:{
          type: String
        },
        res_fiscale1:{
          type: String
        },
        nom_c:{
          type: String
        },
        res_fiscale2:{
          type: String
        },
        date_regime1_a: {
          type: String
        },
        date_regime2_a: {
          type: String
        },
        nom_prenom_c:{
          type: String
        },
        num1_a:{
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
        contact_v_Id: {
          type: mongoose.Types.ObjectId
        },
        contact_a_Id: {
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
        charges_Vendeur_properties:{
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
        },
        pieces_transmises: {
          type: Array,
          required: false,
          //monObjet
           //{"Carnet_dentretien_de_limmeuble":1 ,"Dossier_de_diagnostic_technique":2}//, "Lettre_d'intention_d'achat", "Statuts_de_la_SCI","Convention,Dossier_de_diagnostic_technique","Dernier_de_taxes","liste_détaillée_et_chiffrée","3_derniers_PV_d","Diagnostic_technique_global","Reglement_de_copropriété","Carte_d'identité","Baux"],
        },
        /*"pieces_transmises.$" : {
           type: String,
        }*/
        
        
  },
  
  {
    timestamps: true,
    collection: "dossierNotaires"
  }
);

export default mongoose.model("DossierNotaire", schema);
