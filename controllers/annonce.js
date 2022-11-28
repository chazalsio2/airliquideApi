import _ from "underscore";
import Project from "../models/Project";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import Annonce from "../models/Annonce";

/**
 * Creation d'une annonce
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
export async function createAnnonce(req, res, next) {
    try {
        // const { projectId } = req.params;
        // const project = await Project.findById(projectId).lean();
        // if (!project) {
        //     return next(generateError("Project not found", 404));
        // }

        const {
            reference,
            published,
            titre,
            titre_anglais,
            texte,
            texte_anglais,
            date_saisie,
            visite_virtuelle,
            photo,
            //bien
            b_code_type,
            b_pays,
            b_code_postal_reel,
            b_ville_reelle,
            b_code_postal,
            b_ville,
            b_ville_insee,
            b_quartier,
            b_departement,
            b_surface,
            b_nb_pieces_logement,
            b_surface_sejour,
            b_nombre_de_chambres,
            b_annee_construction,
            b_nb_salles_de_bain,
            b_nombre_etages,
            b_nombre_stationnement,
            b_type_stationnement,
            b_balcon,
            b_d_dpe_valeur_ges,
            b_d_dpe_etiquette_ges,
            b_d_dpe_valeur_conso,
            b_d_dpe_etiquette_conso,
            b_negociateur_nom,
            b_negociateur_prenom,
            b_negociateur_adresse,
            b_negociateur_cp,
            b_negociateur_ville,
            b_negociateur_telephone,
            b_negociateur_email,
            b_nom_residence,
            b_wc_independant,
            // Prestation
            p_type,
            p_mandat_type,
            p_prix,

        } = req.body;



        const photos = {};
        if (photo) {
            photos.photo = photo;
        }
        const bien = {};
        if (b_code_type) {
            bien.b_code_type = b_code_type;
        }
        if (b_pays) {
            bien.b_pays = b_pays;
        }
        if (b_code_postal_reel) {
            bien.b_code_postal_reel = b_code_postal_reel;
        }if (b_ville) {
            bien.b_ville = b_ville;
        }
        if (b_ville_reelle) {
            bien.b_ville_reelle = b_ville_reelle;
        }
        if (b_ville_reelle) {
            bien.b_ville_reelle = b_ville_reelle;
        }
        if (b_code_postal) {
            bien.b_code_postal = b_code_postal;
        }
        if (b_ville_insee) {
            bien.b_ville_insee = b_ville_insee;
        }
        if (b_quartier) {
            bien.b_quartier = b_quartier;
        }
        if (b_departement) {
            bien.b_departement = b_departement;
        }
        if (b_surface) {
            bien.b_surface = b_surface;
        }
        if (b_nb_pieces_logement) {
            bien.b_nb_pieces_logement = b_nb_pieces_logement;
        }
        if (b_surface_sejour) {
            bien.b_surface_sejour = b_surface_sejour;
        }
        if (b_nombre_de_chambres) {
            bien.b_nombre_de_chambres = b_nombre_de_chambres;
        }
        if (b_annee_construction) {
            bien.b_annee_construction = b_annee_construction;
        }
        if (b_nb_salles_de_bain) {
            bien.b_nb_salles_de_bain = b_nb_salles_de_bain;
        }
        if (b_nombre_etages) {
            bien.b_nombre_etages = b_nombre_etages;
        }
        if (b_nombre_stationnement) {
            bien.b_nombre_stationnement = b_nombre_stationnement;
        }
        if (b_type_stationnement) {
            bien.b_type_stationnement = b_type_stationnement;
        }
        if (b_balcon) {
            bien.b_balcon = b_balcon;
        }
        bien.diagnostiques = {};
        if (b_d_dpe_valeur_ges) {
            bien.diagnostiques.b_d_dpe_valeur_ges = b_d_dpe_valeur_ges;
        }
        if (b_d_dpe_etiquette_ges) {
            bien.diagnostiques.b_d_dpe_etiquette_ges = b_d_dpe_etiquette_ges;
        }
        if (b_d_dpe_valeur_conso) {
            bien.diagnostiques.b_d_dpe_valeur_conso = b_d_dpe_valeur_conso;
        }
        if (b_d_dpe_etiquette_conso) {
            bien.diagnostiques.b_d_dpe_etiquette_conso = b_d_dpe_etiquette_conso;
        }
        if (b_negociateur_nom) {
            bien.b_negociateur_nom = b_negociateur_nom;
        }
        if (b_negociateur_prenom) {
            bien.b_negociateur_prenom = b_negociateur_prenom;
        }
        if (b_negociateur_adresse) {
            bien.b_negociateur_adresse = b_negociateur_adresse;
        }
        if (b_negociateur_cp) {
            bien.b_negociateur_cp = b_negociateur_cp;
        }
        if (b_negociateur_ville) {
            bien.b_negociateur_ville = b_negociateur_ville;
        }
        if (b_negociateur_telephone) {
            bien.b_negociateur_telephone = b_negociateur_telephone;
        }
        if (b_negociateur_email) {
            bien.b_negociateur_email = b_negociateur_email;
        }
        if (b_nom_residence) {
            bien.b_nom_residence = b_nom_residence;
        }
        if (b_wc_independant) {
            bien.b_wc_independant = b_wc_independant;
        }

        const prestation = {};
        if (p_type) {
            prestation.p_type = p_type;
        }
        if (p_mandat_type) {
            prestation.p_mandat_type = p_mandat_type;
        }
        if (p_prix) {
            prestation.b_code_type = b_code_type;
        }

        const AnnonceData = {
            reference,
            published,
            titre,
            titre_anglais,
            texte,
            texte_anglais,
            date_saisie,
            visite_virtuelle,
            photos, // OBJET
            bien, // OBJET
            prestation // OBJET
        };
        //console.log( "AnnonceData :", AnnonceData)
        await new Annonce(AnnonceData).save();

        return res.json({ success: true,data: { completed: true } });
    } catch (e) {
        next(generateError(e.message));
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
