# Vision-r api

[![N|Solid](https://cldup.com/dTxpPi9lDf.thumb.png)](https://nodesource.com/products/nsolid)

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Dans le repos ivisionr-Api nous retrouvons tous ce qui va permettre d'executer la platforme.
C'est le back-end de la platforme. On retrouvera :

- La creation de client.
- L'envoie des mails.
- La gestion des status des utilisateurs (admin, commerciaux, client, ...).
- La gestions des documents (upload).
- La simulation.

## Installation

Dillinger requires [Node.js](https://nodejs.org/) v10+ to run.

Pour pouvoir utiliser les fonctionnalité de façon optimal, il faudra installer npm et Nodejs.
Vous pourrer installer cela par le lien au-dessus ou par la commande suivante:

```sh
sudo apt install nodejs
npm -v //pour savoir la version installer de npm
node -v //pour savoir la version installer de npm
```
Si tout c'est bien passé, vous pourrez ensuite installer toutes [dépendance](https://cloud.google.com/functions/docs/writing/specifying-dependencies-nodejs?hl=fr) qui se trouve dans le package.json pour faire fonctionner le projet.  
Vous allez ensuite lancer le projet avec la commande.

```sh
npx nodemon main.js
```

## Main.js

```
// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("babel-polyfill");

require("babel-register")({
  presets: ["env"],
});

// Import the rest of our application.
module.exports = require("./server.js");
```
Grace à [Babel](https://babeljs.io/) tout le code sera [transpiler](https://fr.wikipedia.org/wiki/Compilateur_source_%C3%A0_source).
## server.js
- Tout d'abord on va venir verifier avec [`process.env.NODE_ENV` ](https://hub.packtpub.com/building-better-bundles-why-processenvnodeenv-matters-optimized-builds/) si on travaille bien en mode developpement et non en mode production.
- Ensuite on vient initialiser le système d'authentifiction avec `passport` et avec la fonction `configureAuthStrategy(passport)` on va venir vérifierle dans le JSON l'ID reçu dans l'[Header](https://fr.wikipedia.org/wiki/Header#:~:text=Le%20header%2C%20ou%20en%2Dt%C3%AAte,appel%C3%A9es%20charge%20utile%20ou%20body.) pour voir si l'utilisateur qui se connecte existe bien.
- Grace à la fonction `createRoutes(app)` on va venir "initialiser" toutes les routes de la plateforme.
- La dernière étape dans le fichier server.js sera de créer la connexion la base de données grace à mongoose et de lancer le serveur.

## configure-auth-strategy.js
La fonction prend en paramètre `passport` qui va contenir les informations de la personne qui tente de ce connecter. A partir de ses information il va venir récupérer l'ID de l'utilisateur pour voir si celui-ci existe bien.
Dans le cas ou l'utilisateur existe bien, la fonction va retourner un [boolean](https://koor.fr/Java/Tutorial/java_type_booleen.wp#:~:text=Le%20type%20bool%C3%A9en%20est%20un,(l'%C3%A9tat%20faux).) `True`  et dans le cas contraire `False`.

## routes.js

Dans ce fichier de plus de 800 lignes, permettra de naviguer sur la plateforme et selon le status que vous avez `Admin, Commmercial ou Client`, vous aurez accès seulement à certaine partie de la plateforme. Il y a quand même des routes publique pour le sutilisateurs qui ne sont pas connectés ou qui n'ont pas de compte. Il pourrant juste avoir accès au page pour se connecter, créer un compte, ou rénitialiser son passe. Pour changer de page on utilisera des requête [HTTP](https://developer.mozilla.org/fr/docs/Web/HTTP/Methods) `GET, POST, PUT, DELET`, selon le besoin de récupérer, envoyer, mettre à jour ou supprimer une information.
Voici un exemple de code pour aller sur la page contact.
``` sh
app.get(
    "/contacts",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getContacts,
    errorHandle
  );
```
Avec requête on va venir récupérer les informations sur la page contacte, mais avant d'afficher ça pour la sécurité on va venir vérifier notre identité grace à `passport.authenticate("jwt", { session : false })`  qui va venir vérifier notre jeton. Ensuite `checkAccountDesactivated` va venir vérifier si notre compte n'est pas désactivé. Si notre est valide on pourra récupérer les contacts avec la fonction `getContacts` et en cas d'erreur la fonction `errorHandle` sera appelé.
Selon les requête on utilisera les fonctions `checkAdmin, checkAdminOrCommercial, checkAdminOrCommercialOrSearchClient` pour vérifier le droit de l'utilisateur et lui limiter l'accés à certaine partie de la plateforme.
## License

**Made By Alexandre**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
