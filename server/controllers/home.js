'use strict';

exports.index = (req, res) => {
  res.render('home', {
    title: 'Home',
  });
};
