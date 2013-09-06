module.exports = function (sequelize, models) {

    var make_commentable = function (model) {
        model.belongsTo(models.Commentable, {as: 'commentable'});

        models.Commentable.hasOne(model);
    };

    var make_approvable = function (model) {
        model.belongsTo(models.Approvable, {as: 'approvable'});

        models.Approvable.hasOne(model);
    };

    var make_acl = function (model) {
        model.hasMany(models.Acl, {as: 'acls', joinTableName: model.tableName + '_acls'});

        models.Acl.hasMany(model, {joinTableName: model.tableName + '_acls'});
    };

    var make_keywords = function (model) {
        model.hasMany(models.Keyword, {as: 'keywords', joinTableName: model.tableName + '_keywords'});

        models.Keyword.hasMany(model, {joinTableName: model.tableName + '_keywords'});
    };

    models.Achievement
        .hasMany(models.Achievement, {joinTableName: 'achivement_children'})
        .belongsTo(models.Media, {as: 'badge'})
        .hasMany(models.I18nString, {as: 'names', joinTableName: 'achievement_names'})
        .hasMany(models.I18nText, {as: 'description', joinTableName: 'achievement_descriptions'})
        ;


    models.AchievementStatus
        .hasMany(models.Media, {as: 'medias', joinTableName: 'achievement_statuses_media'})
        .belongsTo(models.User, {as: 'owner'})
        ;

    models.Application
        .hasMany(models.Client)
        .hasMany(models.User, {as: 'admin', joinTableName: 'applications_users_admin'})
        ;

    models.Client
        .belongsTo(models.Application, {as: 'application'})
        .belongsTo(models.User, {as: 'user'})
        ;

    models.I18nString
        .belongsTo(models.Locale, {as: 'locale'})
        .hasMany(models.Achievement, {joinTableName: 'achievement_names'})
        ;

    models.I18nText
        .belongsTo(models.Locale, {as: 'locale'})
        .hasMany(models.Achievement, {joinTableName: 'achievement_descriptions'})
        ;

    models.Locale
        .hasOne(models.I18nString)
        .hasOne(models.I18nText)
        .hasOne(models.User)
        .hasOne(models.News)
        ;

    models.News
        .belongsTo(models.User, {as: 'author'})
        .belongsTo(models.Locale, {as: 'locale'})
        ;

    models.User
        .hasMany(models.User, {as: 'following', joinTableName: 'user_followings'})
        .hasMany(models.User, {as: 'followers', joinTableName: 'user_followings'})
        .belongsTo(models.Locale, {as: 'locale'})
        .belongsTo(models.Media, {as: 'avatar'})
        .hasMany(models.Role, {as: 'roles'})
        .hasMany(models.Application, {as: 'applications_managed', joinTableName: 'applications_users_admin'})
        .hasOne(models.AchievementStatus)
        .hasOne(models.Acl)
        .hasMany(models.Client)
        .hasOne(models.News)
        ;

    models.Media
        .hasMany(models.AchievementStatus, {joinTableName: 'achievement_statuses_media'})
        .hasOne(models.Achievement)
        .hasOne(models.User)
        ;

    make_acl(models.Achievement);
    make_acl(models.Locale);
    make_approvable(models.AchievementStatus);
    make_approvable(models.Approval);
    make_approvable(models.News);
    make_commentable(models.AchievementStatus);
    make_commentable(models.Comment);
    make_commentable(models.News);
    make_keywords(models.Achievement);
    make_keywords(models.News);

    sequelize.sync();
};
