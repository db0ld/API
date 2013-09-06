var models = {};

var LifeSequelize = function () {
    var Sequelize = require('sequelize');
    var fs = require('fs');
    var LifeConfig = require('./LifeConfig.js');

    var sequelize = null;
    var modelsPath = "";

    this.setup = function (path) {
        modelsPath = path;

        sequelize = new Sequelize(LifeConfig.db_path);
        init();
    };

    this.model = function (name) {
        return models[name];
    };

    this.Seq = function () {
        return Sequelize;
    };

    function init() {
        fs.readdirSync(modelsPath).forEach(function (name) {
            if (name.match(/\.js$/i)) {
                var modelName = name.replace(/\.js$/i, '');

                models[modelName] = sequelize.import(modelsPath + '/' + name);
            }
        });

        if (fs.existsSync(modelsPath + '/meta/Relations.js')) {
            require(modelsPath + '/meta/Relations.js')(sequelize, models);
        }
    }

    this.params = function (options) {
        var i;
        var defaults = {
            timestamps: false,
            paranoid: true,
            underscored: true,
            freezeTableName: false,
            foreignKeyConstraint: true
        };

        if (options === undefined) {
            options = {};
        }

        for (i in options) {
            if (options.hasOwnProperty(i)) {
                defaults[i] = options[i];
            }
        }

        return defaults;
    };
};

LifeSequelize.instance = null;

LifeSequelize.getInstance = function(){
    if (this.instance === null) {
        this.instance = new LifeSequelize();
    }

    return this.instance;
};

module.exports = LifeSequelize.getInstance();