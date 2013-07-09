API
===

The gLife API Web service, used by web client, mobile clients and public dev.

Requirements
------------

You'll need :
* [MongoDB](http://www.mongodb.org/)
* [node.js](http://nodejs.org/)
* [A well designed brain](http://llau.me/31)

Installing
----------

npm install†


†On older Ubuntu versions you may need to upgrade to a newer node.js release.

This PPA should be good https://launchpad.net/~chris-lea/+archive/node.js/+packages

**Downside**: No Maverick repo available. That version is not maintained anymore by Canonical and is still used by the EIP Laboratory. We can only compile it on that platform.


Launch API server
-----------------

node app.js


Open a simple API console
-------------------------

iexplore.exe [http://localhost:2048](http://localhost:2048)

Format POST data as a JSON encoded key/value dictionary.

Code
----

Models are in models/*.js

API methods in controllers/*.js

http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml