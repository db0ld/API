Anatomie d'une méthode d'API
============================

Dans chacun des controleurs se trouve un bloc semblable à celui qui suit,
définissant les diverses méthodes de l'API.


```
module.exports = function (router) {

    router

        .Post('Add a child achievement to parent')
        .route('achievements/:achievement_id/children', true)
        .input({achievement_id: {type: Achievement}})
        .output(Achievement)
        .error(LifeErrors.NotFound)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
           return new LifeResponse(req, res).single(new Achievement());
        })

        // other API methods

};
```


```
.Post('Add a child achievement to parent')
```


Ceci définie la méthode HTTP pour la route qui va être définie. Ici c'est Post
mais ça aurait très bien pu être Get, Put, Delete, Options ou Head. Dans tous
les cas l'unique paramètre est la documentation associée à cette méthode d'API.

En arrière plan un nouvel élement LifeRouter.Method est créé par le routeur,
mais aucun paramètre d'entrée/sortie, route ou l'authentification n'est encore
renseigné.

```
.route('achievements/:achievement_id/children', true)
```

Cette ligne définie la route sur laquelle doit écouter l'API. Le routeur se
charge de préfixer celle-ci par le numéro de version actuel.

Il est possible de définir plusieurs routes en appellant de nouveau cette
fonction.

Aussi, il est possible de définir de façon explicite si cette route doit être
publique (false) ou privée (true), par défaut le paramètre est à true.

```
.input({achievement_id: {type: Achievement}})
```

input définie... le format d'entrée. Cela n'est effectif que sur les routes en
POST ou en PUT, la validation est faite automatiquement par le routeur. En cas
d'erreur sur un argument le corps de la méthode n'est pas exécuté, une erreur
est retournée.

L'arguement de cette méthode est un dictionnaire formatté de la façon suivante :


```
{
    param_a: {
        type: String,
        required: true
    },

    param_b: {
        type: /^test$/,
        required: false
    },

    param_c: {
        type: Date,
        required: false,
        default: new Date('1989-11-16')
    }
}
```

Ici le paramètre param_a sera de type String, requis.

param_b n'est pas requis mais devra correspondre à la RegExp donnée dans type
(c'est donc un peu idiot mais il devra obligatoirement valoir "test" :)

param_c quant à lui devra correspondre à une date, et aura pour valeur par
défaut la date de la chute du mur de Berlin.

Il existe d'autres types ; ceux propres à JavaScript (Number, String, RegExp,
Date), ceux correspondant à des transferts de fichier (voir LifeUpload), un
modèle Mongoose (il faudra fournir l'ObjectId du document), ou ceux
correspondant à des contraintes usuelles : des Enum, des adresses e-mails etc.
tout ça se trouve dans dans LifeConstraint.

```
.output(Achievement)
```

Un peu comme les types de input, on peut fournir ici un modèle Mongoose, un type
JavaScript natif qui décrira le retour de la méthode.

À noter : il existe la méthode appelée list() qui prend le même argument mais
décrivant un retour sous forme de liste paginée par l'API.


```
.error(LifeErrors.NotFound)
```

Renseigne un cas d'erreur pouvant survenir dans cette méthode. Voir LifeErrors
pour davatage d'informations.


```
.auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
```

Deux cas possibles :

* Quels sont les rôles nécessaires pour accéder à cette méthode ?
  Comme c'est le cas ici il est nécessaire de fournir les rôles sous forme d'un
  tableau ;

* Il est nécessaire d'être authentifié pour avoir accès à cette méthode ?
  Il suffit de mettre true en argument.


```
.add(function (req, res, next, params) {
   return new LifeResponse(req, res).single(new Achievement());
})
```

Le nerf de la guerre, la cerise sur le gâteau, l'anguille sous ro... Euh... ces
expressions ne veulent absolument rien dire ici.

.add() va enregister les routes précédemment définies dans le routeur et définir
la fonction de callback.

Celle ci prend 4 paramètres :

* req, la requête Express ;
* res, la réponse Express ;
* next, la fonction traitant les erreurs ;
* params, s'il y a eu une validation le résultat de celle-ci.

Oui, bon, ensuite il n'y a pas de traitement, on renvoit simplement un objet
Achievement tout vide.