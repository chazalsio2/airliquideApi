import _ from "underscore";
import Property from "../models/Property";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import Annonce from "../models/Annonce";
import moment from 'moment';
const fs = require('fs')
/**
 * Creation d'une annonce
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
export async function createAnnonce(propertyId,visibles,req,res,next) {
    try {
        const biens = await Property.findById(propertyId).lean();

        if (!biens) {
             throw new Error("Property not found", 404);
        }

        const type = ()=> {
           if(biens.type === "Appartement"){
            return "1100"
           }
           if(biens.type === "Maison"){
            return "1200"
           }
           if(biens.type === "Terrain de construction"){
            return "1300"
           }
           if(biens.type === "Local commercial"){
            return "2430"
           }
           if(biens.type === "Immeuble"){
            return "1500"
           }
           if(biens.type === "Garage / Parking"){
            return "1421"
           }
        }

        const photos = {};
        if (biens.photos) {
            photos.photo = biens.photos;
        }
        const bien = {};
        if (biens.type) {
            bien.b_code_type = type();
            bien.libelle_type= biens.type;
        }
        if (biens.ZoneSector) {
            bien.b_pays = biens.ZoneSector;
        }
        if (biens.code_postale) {
            bien.b_code_postal_reel = biens.code_postale;
        }if (biens.city) {
            bien.b_ville = biens.city;
        }
        if (biens.city) {
            bien.b_ville_reelle = biens.city;
        }
        if (biens.code_postale) {
            bien.b_code_postal = biens.code_postale;
        }
        if (biens.city) {
            bien.b_ville_insee = biens.city;
        }
        // if (b_quartier) {
        //     bien.b_quartier = b_quartier;
        // }
        // if (b_departement) {
        //     bien.b_departement = b_departement;
        // }
        if(biens.ZoneSector){
            bien.pays= biens.ZoneSector;
        }
        if (biens.livingArea||biens.landArea) {
            bien.b_surface = biens.livingArea||biens.landArea;
        }
        // a voir avec nombre de cambre 
        // if (biens.numberOfRooms) {
        //     bien.b_nb_pieces_logement = biens.numberOfRooms;
        // }
        // if (b_surface_sejour) {
        //     bien.b_surface_sejour = b_surface_sejour;
        // }
        if (biens.numberOfRooms) {
            bien.nb_pieces_logement = biens.numberOfRooms;
        }
        if (biens.yearOfConstruction) {
            bien.b_annee_construction = biens.yearOfConstruction;
        }
        //donneé manquante
        // if (b_nb_salles_de_bain) {
        //     bien.b_nb_salles_de_bain = b_nb_salles_de_bain;
        // }
        if (biens.floor) {
            bien.b_nombre_etages = biens.floor;
        }
        //donneé manquante
        // if (b_nombre_stationnement) {
        //     bien.b_nombre_stationnement = b_nombre_stationnement;
        // }
        // if (b_type_stationnement) {
        //     bien.b_type_stationnement = b_type_stationnement;
        // }
        // if (b_balcon) {
        //     bien.b_balcon = b_balcon;
        // }
        // bien.diagnostiques = {};
        // if (b_d_dpe_valeur_ges) {
        //     bien.diagnostiques.b_d_dpe_valeur_ges = b_d_dpe_valeur_ges;
        // }
        // if (b_d_dpe_etiquette_ges) {
        //     bien.diagnostiques.b_d_dpe_etiquette_ges = b_d_dpe_etiquette_ges;
        // }
        // if (b_d_dpe_valeur_conso) {
        //     bien.diagnostiques.b_d_dpe_valeur_conso = b_d_dpe_valeur_conso;
        // }
        // if (b_d_dpe_etiquette_conso) {
        //     bien.diagnostiques.b_d_dpe_etiquette_conso = b_d_dpe_etiquette_conso;
        // }
        // if (b_negociateur_nom) {
        //     bien.b_negociateur_nom = b_negociateur_nom;
        // }
        // if (b_negociateur_prenom) {
        //     bien.b_negociateur_prenom = b_negociateur_prenom;
        // }
        // if (b_negociateur_adresse) {
        //     bien.b_negociateur_adresse = b_negociateur_adresse;
        // }
        // if (b_negociateur_cp) {
        //     bien.b_negociateur_cp = b_negociateur_cp;
        // }
        // if (b_negociateur_ville) {
        //     bien.b_negociateur_ville = b_negociateur_ville;
        // }
        // if (b_negociateur_telephone) {
        //     bien.b_negociateur_telephone = b_negociateur_telephone;
        // }
        // if (b_negociateur_email) {
        //     bien.b_negociateur_email = b_negociateur_email;
        // }
        // if (b_nom_residence) {
        //     bien.b_nom_residence = b_nom_residence;
        // }
        // if (b_wc_independant) {
        //     bien.b_wc_independant = b_wc_independant;
        // }

        const prestation = {};
        if (biens.type) {
            prestation.p_type = biens.type;
        }
        if (biens.propertyStatus) {
            prestation.p_mandat_type = `${biens.propertyStatus === "forsale" ? "Vente" : "Chasse"}`;
        }
        if (biens.salesPrice) {
            prestation.p_prix = biens.salesPrice;
        }

        
        const AnnonceData = {
            reference:biens.ref,
            // published,
            titre:biens.name,
            texte: biens.description,
            date_saisie: moment(biens.createdAt).format('DD/MM/YYYY'),
            visite_virtuelle: biens.virtualVisitLink,
            photos, // OBJET
            bien, // OBJET
            prestation // OBJET
        };
        //console.log( "AnnonceData :", AnnonceData)
        const annonce = await new Annonce(AnnonceData).save();
        if(annonce){
            fs.appendFile('annonce.json', `${JSON.stringify(annonce)}` , function (err) {   if (err) throw console.log(err);   console.log('Fichier créé !');});
        }


        // return res.json({ success: true,data: { completed: true,annonce:annonce } });
    } catch (e) {
        throw new Error(e.message);
    }
}

/**
 * Avoir toutes les Annonces
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
export async function getAnnonces(req, res, next) {
    try {
        const annoncesCount = await Annonce.countDocuments().exec();
        const allAnnonces = await Annonce.find({},{_id:0, createdAt:0,updatedAt:0, __v:0})
        return res.json({
            success: true,
            data: {
        client:{ // Pour respecter l'arborescence (voir la doc d'ubiflow)
            annonce: allAnnonces
        }, total: annoncesCount }
        });
    } catch (e) {
        next(generateError(e.message));
    }
}

// TODO : UPDATE & DELETE Annonce
