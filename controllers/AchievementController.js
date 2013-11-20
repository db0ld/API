var _ = require('lodash'),
    mongoose = require('mongoose'),
    Achievement = mongoose.model('Achievement'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
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

            LifeData.i18nFiller(['name', 'description'], achievement, context.locale, context.input);

            achievement._parents = context.input.parents;

            return new LifeQuery(Achievement, context).save(achievement);
        })

        .Put('Edit an achievement')
        .input([
            new LifeConstraints.Length(2, 255, 'name', false),
            new LifeConstraints.String('description', false),
            new LifeConstraints.Boolean('category', false),
            new LifeConstraints.Boolean('secret', false),
            new LifeConstraints.Boolean('discoverable', false),
            new LifeConstraints.HexColor('color', false),
            new LifeConstraints.Picture('badge', false, {output_picture: true}),
        ])
        .auth(['ROLE_ADMIN_ACHIEVEMENT'])
        .route(routeBase + '/:achievement_id')
        .params([
            new LifeConstraints.MongooseObjectId(Achievement, 'achievement_id'),
        ])
        .add(function (context) {
            var achievement = context.params('achievement_id')

            LifeData.i18nFiller(['name', 'description'], achievement, context.locale, context.input);

            achievement._parents = context.input.parents;

            return new LifeQuery(Achievement, context).save(achievement);
        })

        .Get('Get achievements')
        .route(routeBase)
        .filters(Achievement.filters)
        .add(function (context) {
            return new LifeQuery(Achievement, context)
                .filters()
                .exec();
        })

        .Get('Get a single achievement')
        .route(routeBase + '/:achievement_id')
        .params([
            new LifeConstraints.MongooseObjectId(Achievement, 'achievement_id'),
        ])
        .add(function (context) {
            return context.send.single(context.params('achievement_id'));
        })

        .Delete('Delete an achievement')
        .route(routeBase + '/:achievement_id')
        .auth(['ROLE_ADMIN_ACHIEVEMENT'])
        .params([
            new LifeConstraints.MongooseObjectId(Achievement, 'achievement_id'),
        ])
        .add(function (context) {
            return new LifeQuery(Achievement, context)
                .findById(context.params('achievement_id').id)
                .remove();
        });

};