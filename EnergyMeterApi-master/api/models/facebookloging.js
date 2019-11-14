const passport=require('passport');
const FacebookTokenStratergy=require('passport-facebook-token');
let config=require('./Config');



passport.use('facebookToken',new FacebookTokenStratergy({
  clientID:config.facebook.clientID,
  clientSecret:config.facebook.clientSecret
 } ,(accessToken,refreshToken,profile,done) => { 
   try {
        User = new user();
        // console.log('profile',profile);
        // console.log('accessToken',accessToken);
        // console.log('refreshToken',refreshToken); 
      done(null,profile);
       
     } catch(error) {
       done(error ,false,error.message);
     }
  }));
 