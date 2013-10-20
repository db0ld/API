var _ = require('lodash'),
    mongoose = require('mongoose'),
    Achievement = mongoose.model('Achievement'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    routeBase = 'achievements';

module.exports = function (router) {
    router

        .Post('Create an achievement')
        .input([
            new LifeConstraints.Length(2, 255, 'name'),
            new LifeConstraints.String('description'),
            new LifeConstraints.MongooseObjectIds(Achievement, 'parents', false),
            new LifeConstraints.Boolean('category', false),
            new LifeConstraints.Boolean('secret', false),
            new LifeConstraints.Boolean('discoverable', false),
            new LifeConstraints.HexColor('color', false),
            new LifeConstraints.Picture('badge', false, {output_picture: true}),
        ])
        .auth(['ROLE_ADMIN_ACHIEVEMENT'])
        .route(routeBase)
        .add(function (context) {
            var achievement = _.cloneDeep(context.input);

            achievement.name = [{
                string: context.input.name,
                locale: 'en-US'
            }];

            achievement.description = [{
                string: context.input.description,
                locale: 'en-US'
            }];

            achievement._parents = context.input.parents;

            return new LifeQuery(Achievement, context).save(achievement);
        })

        .Get('Get achievements')
        .route(routeBase)
        .add(function (context) {
            var query = new LifeQuery(Achievement, context);

            /*if (!context.query('term', null)) {
                query.root();
            } else {
                // TODO: search by term
            }*/

            return query.exec();
        });


};