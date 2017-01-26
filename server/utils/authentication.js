import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcryptOriginal from 'bcrypt';
import Promise from 'bluebird';
import { User } from '../db/models';

var bcrypt = Promise.promisifyAll(bcryptOriginal);

passport.use(new LocalStrategy({ passReqToCallback: true },
  function(req, username, password, done) {
    User.findOne({ username: username }).then(function(user) {
      bcrypt.compareAsync(password, user.password)
        .then(function(isCorrect) {
          return isCorrect ? done(null, user) : done(null, false);
        }).catch(function(err) {
          done(err); 
        });
    });
  }));

function register(req, res, next) {
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;

  console.log(User);

  User.find({ username: username })
    .exec(function(user) {
      console.log('found user', user);
      if (!user) {
        return bcrypt.genSaltAsync()
          .then(function(salt) {
            return bcrypt.hashAsync(password, salt);
          }).then(function(hashedPassword) {
            var newUser = new User({ 
              username: username,
              password: hashedPassword
            });

            return newUser.save();
          }).then(function(user) {
            console.log('user saved!', user); 
            res.end('saved');
          }).catch(function(err) {
            console.log('some kind of error', err); 
            res.setStatus(400).end();
          });
      } else {
        res.end('user exists');
      }
    });
}

export { passport, register };
