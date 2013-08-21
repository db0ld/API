API Web service
===============

The interactions between the database and our services is strictly deﬁned by [this API](http://life.db0.fr/api/).

This web service is based on this API.

Install, launch, test!
----------------------

### Requirements

You'll need to install:
* [MongoDB](http://www.mongodb.org/)
* [Node.js](http://nodejs.org/)
* [A well designed brain](http://llau.me/31)

### Install

```shell
npm install
```

On older Ubuntu versions use the binary distribution from [NodeJS website](http://nodejs.org/download/).

This [PPA](https://launchpad.net/~chris-lea/+archive/node.js/+packages) should be good on newer releases.

### Launch API server

```shell
node app.js
```

### Open a simple API console

In a browser, open: [http://localhost:2048](http://localhost:2048)

To send POST data, write it in the textarea on the left, formatted in a simple
[JSON key/value dictionary](http://www.json.org).

Developer corner
----------------

### First things first

As a developer, you are required to read and take into account the information
in [the general documentation](http://glife.fr/F.A.Q.).

You will also need to know and use the [official API documentation](http://life.db0.fr/api).

### Model/Controller

This project uses a __model/controller__ design pattern.

* Models are in `models/`
* API methods in `controllers/`

To add a new set of methods, create a new file in the model folder and a new file in the
controller folder, using the existing ones as inspiration (`achievement.js` for instance).

### Coding Style

To check your files use jslint with options

* --indent 4
* --node
* --nomen
* --vars
* --stupid
* --newcap
* --todo
