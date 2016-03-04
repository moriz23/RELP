var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var passport = require('../config/passport');
var client = require("../api/yelp.js");

var GoogleLocations = require('google-locations');

var locations = new GoogleLocations('AIzaSyCqHWFDIibdD6pRFtI0jSW-s2OU1XLa_jU');
var Review = require('../models/review');


//get routes
router.get('/', function(req, res) {
  res.render('registration', {
    msg: req.query.msg
  });
});

//ROUTE TO INDEX
router.get('/index', function(req, res) {
  res.render('index', {
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

//GETTING USER REVIEWS INPUT
// router.get('/reviews', function(req, res) {
//   Review.findAll().then(function(reviews) {
//     res.render('yelp-business', {
//       user: req.user,
//       isAuthenticated: req.isAuthenticated(),
//       reviews: reviews
//     });
//   });
// });

/*********************
     POST ROUTES
*********************/

//CREATES USER TABLE AND SAVES REGISTER INPUT INTO DB
router.post('/save', function(req, res) {
  User.create(req.body).then(function(user) {
    req.session.authenticated = user;
    res.redirect('/index');
  }).catch(function(err) {
    res.redirect("/?msg=" + err);
    console.log(err);
  });
});

//LOGIN POST LEADS TO INDEX PAGE
router.post('/', passport.authenticate('local', {
  successRedirect: '/index',
  failureRedirect: '/?msg=Login Credentials do not work'
}));

//REVIEWS POST
router.post('/:business/reviews', function(req, res) {

    Review.create(req.body).then(function(review){
      var comment = req.body.comment;
      console.log(comment);
      req.session.authenticated = review;
      res.redirect(BUSINESS_NAME)
      res.render('yelp-business', {
        reviews: comment,
        layout: 'yelp-business'

    });
  }).catch(function(err){
      res.redirect("/?msg=" + err);
      console.log(err);
  });
})


/*********************
     GET Yelp
*********************/
router.get('/yelp', function(req, res) {
  res.render('yelp', {
    msg: req.query.msg,
    layout: 'yelp-search'
  });
});

/*********************
     POST Yelp
*********************/
router.post('/yelp', function(req, res) {
  // console.log(req.body);
  client.search({
    term: req.body.find,
    location: 'New Brunswick, New Jersey',
    limit: 10
  }).then(function(data) {
    var businesses = data.businesses;

    res.render('yelp', {
      msg: req.query.msg,
      layout: 'yelp-search',
      results: businesses
    });
  });
});
/*********************
     GET business
*********************/
router.get('/:business', function(req, res) {
  var business = req.params.business;
  client.business(business, {
    cc: "US"
  }).then(function(data) {
    console.log(data);

    res.render('yelp-business', {
      msg: req.query.msg,
      layout: 'yelp-business',
      info: data
    });
  });
});

module.exports = router;