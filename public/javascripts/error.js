var express = require('express');
var logger = require('../../logger');

function renderError(res, err) {
    logger.error(err);
    return res.format({
        html: function() {
            res.render('errorLog', {
                "error": err,
            });
        },
        json: function() {
            res.json(err);
        }
    });
}

module.exports = renderError;