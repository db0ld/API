var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    mongoose = require('mongoose'),
    models = require('./public/models.js'),
    port = 2048;

var app = express();

// Database

mongoose.connect('mongodb://localhost/life');

// Config

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(application_root, "public")));
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get(['/', '/api'], function (req, res) {
  res.send('Life API is alive! <a href="apitest.html">API Console is here</a>');
});

var apiResponse = function(res, req, data) {
    if (req.callback) {
        return res.jsonp(data);
    }
    return res.send(data);
};

var requestToObject = function(req, itemType, data) {
  if (typeof data !== 'object') {
    data = {};
  }

  for (var label in itemType.schema.paths) {
    if (req.body[label]) {
      data[label] = req.body[label];
    }
  }

  return data;
};

var getListItems = function(path, itemType) {
    app.get(path, function (req, res){
      return itemType.find(function (err, items) {
        return apiResponse(res, req, err || items);
      });
    });
};

var getSingleItem = function(path, itemType) {
    app.get(path + '/:id', function (req, res){
      return itemType.findById(req.params.id, function (err, item) {
        return apiResponse(res, req, err || item);
      });
    });
};

var postSingleItem = function(path, itemType) {
    app.post(path, function (req, res){
      var item;

      item = new itemType(requestToObject(req, itemType));
      item.save(function (err) {
        return apiResponse(res, req, err || item);
      });
    });
};

var putSingleItem = function(path, itemType) {
    app.put(path + '/:id', function (req, res){
      return itemType.findById(req.params.id, function (err, item) {
        if (err) {
            return apiResponse(res, req, err);
        }

        item = requestToObject(req, itemType, item);
        return item.save(function (err) {
          return apiResponse(res, req, err || item);
        });
      });
    });
};

var deleteSingleItem = function(path, itemType) {
    app.delete(path + '/:id', function (req, res){
      return itemType.findById(req.params.id, function (err, item) {
        if (err) {
            return apiResponse(res, req, err);
        }

        return item.remove(function (err) {
          return apiResponse(res, req, err || item);
        });
      });
    });
};


// Simple default CRUD
for (var itemType in models) {
    if (!models[itemType].routes) {
      continue;
    }

    if (models[itemType].routes.single) {
      // Create items
      postSingleItem('/api/' + models[itemType].routes.single, models[itemType]);

      // Get a single item
      getSingleItem('/api/' + models[itemType].routes.single, models[itemType]);

      // Put a single item
      putSingleItem('/api/' + models[itemType].routes.single, models[itemType]);

      // Delete a single item
      deleteSingleItem('/api/' + models[itemType].routes.single, models[itemType]);
    }

    if (models[itemType].routes.plural) {
      // List all items
      getListItems('/api/' + models[itemType].routes.plural, models[itemType]);
    }
}


// Launch server
console.log('Listening...');
app.listen(port);