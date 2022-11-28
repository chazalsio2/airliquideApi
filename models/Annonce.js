import mongoose from "mongoose";

var schema = new mongoose.Schema(
    {
        reference: {
            type: String,
        },
        published: {
            type: Boolean,
        },
        titre:{
            type: String,
        },
        titre_anglais:{
            type: String,
        },
        texte:{
            type: String,
        },
        texte_anglais:{
            type: String,
        },
        date_saisie: {
            type: String,
        },
        visite_virtuelle: {
            type: String,
            required: false,
        },
        photos: {
            type: Object,
            photo:{
                type: Array,
                items:{
                    type: String
                }
            },
            required: false,
        },
        // Bien
        bien: {
            type: Object,
            properties: {
                code_type: {
                    type: Number,
                    required: true
                },
                pays: {
                    type: String,
                    required: true
                },
                code_postal_reel: {
                    type: Number,
                    required: true
                },
                ville_reelle: {
                    type: String,
                    required: true
                },
                code_postal: {
                    type: Number,
                    required: false
                },
                ville: {
                    type: String,
                    required: true
                },
                ville_insee: {
                    type: Number,
                    required: false
                },
                quartier: {
                    type: String,
                    required: false
                },
                departement: {
                    type: Number,
                    required: false
                },
                surface: {
                    type: Number,
                    required: true
                },
                nb_pieces_logement: {
                    type: Number,
                    required: false
                },
                surface_sejour: {
                    type: Number,
                    required: false
                },
                nombre_de_chambres: {
                    type: Number,
                    required: false
                },
                annee_construction: {
                    type: Number,
                    required: false
                },
                nb_salles_de_bain: {
                    type: Number,
                    required: false
                },
                nombre_etages: {
                    type: Number,
                    required: false
                },
                nombre_stationnement: {
                    type: Number,
                    required: false
                },
                type_stationnement: {
                    type: String,
                    required: false
                },
                balcon: {
                    type: String,
                    required: false
                },
                diagnostiques: {
                    type: Object,
                    required: [],
                    properties: {
                        dpe_valeur_ges: {
                            type: Number
                        },
                        dpe_etiquette_ges: {
                            type: String
                        },
                        dpe_valeur_conso: {
                            type: Number
                        },
                        dpe_etiquette_conso: {
                            type: String
                        }
                    }
                },
                negociateur_nom: {
                    type: String,
                    required: false
                },
                negociateur_prenom: {
                    type: String,
                    required: false
                },
                negociateur_adresse: {
                    type: String,
                    required: true
                },
                negociateur_cp: {
                    type: Number,
                    required: false
                },
                negociateur_ville: {
                    type: String,
                    required: false
                },
                negociateur_telephone: {
                    type: String,
                    required: false
                },
                negociateur_email: {
                    type: String,
                    required: false
                },
                nom_residence: {
                    type: String,
                    required: false
                },
                wc_independant: {
                    type: String,
                    required: false
                }
            }
        },
        // Prestation
        prestation: {
            type: Object,
            properties: {
                type: {
                    type: String,
                    default: "V",
                    required: true
                },
                mandat_type: {
                    type: String,
                    required: true
                },
                prix: {
                    type: Number,
                    required: true
                }
            }
        }
    },
    {
        timestamps: true,
        collection: "Annonce",
    }
);

export default mongoose.model("Annonce", schema);
