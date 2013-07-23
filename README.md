API Web service
===============

The Life API Web service, used by web client, mobile clients and other public developers.

Install, launch, test!
----------------------

### Requirements

You'll need to install:
* [MongoDB](http://www.mongodb.org/)
* [node.js](http://nodejs.org/)
* [A well designed brain](http://llau.me/31)

### Install

```shell
npm install
```

On older Ubuntu versions you may need to upgrade to a newer node.js release.

This PPA should be good https://launchpad.net/~chris-lea/+archive/node.js/+packages

**Downside**: No Maverick repo available. That version is not maintained anymore by
Canonical and is still used by the LabEIP. We can only compile it on that platform.

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
in [the general developer documentation](http://goo.gl/rDjPH).

You will also need to know and use the [official API documentation](http://life.db0.fr/api).

### Model/Controller

This project uses a __model/controller__ design pattern.

* Models are in `models/`
* API methods in `controllers/`

To add a new set of methods, create a new file in the model folder and a new file in the
controller folder, using the existing ones as inspiration (`achievement.js` for instance).

### Coding Style

We use the following coding style:
http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
