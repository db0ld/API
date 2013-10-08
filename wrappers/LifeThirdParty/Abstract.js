var Abstract = function() {
};

Abstract.prototype.getUserId = function (context, token, cb) {
    return context.send.error(new LifeErrors.NotImplemented());
};
