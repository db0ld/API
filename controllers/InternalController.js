/**
 * Route sorting function (path + http method)
 *
 * @param {Object} a
 * @param {Object} b
 * @function
 */
var routesSort = function (a, b) {
    if (a.route === b.route) {
        return a.method < b.method ? -1 : 1;
    }

    return a.route < b.route ? -1 : 1;
};

module.exports = function (router) {
    router

        .Options('Returns HTTP CORS headers for option request')
        .route('*')
        .add(function (context) {
            return context.send.json();
        })

        .Get('Show documentation. This documentation. So meta.')
        .route('doc')
        .add(function (context) {
            var i;

            for (i in router.documentation) {
                if (router.documentation.hasOwnProperty(i)) {
                    router.documentation[i].sort(routesSort);
                }
            }

            return context.send.render('doc.ejs', {
                doc: router.documentation
            });
        });
};