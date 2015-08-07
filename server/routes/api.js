//var express = require('express');
//var db = require('../source/db');
//
//var router = express.Router();
//var TextElement = db.TextElement;
//
//router.get('/text', function(req, res, next) {
//    TextElement.find(function (err,elems) {
//        if(err) return  next(err);
//
//        res.json(elems);
//    });
//});
//
//router.post('/text', function(req, res, next) {
//    TextElement.create(req.body, function (err,post) {
//        if(err) return next(err);
//
//        res.json(post);
//    })
//});
//
//
//module.exports = router;
