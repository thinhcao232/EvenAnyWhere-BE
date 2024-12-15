const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const AccountModal = require("../App/models/accountUser.model");
passport.use(
  new FacebookStrategy(
      {
          clientID: '560749789999134', // App ID từ Facebook
          clientSecret: '8caa20f8cb0f513082cb14a12bdedcff', // App Secret từ Facebook
          callbackURL: 'http://localhost:3000/accounts/facebook/callback', // URL callback
          profileFields: ['id', 'displayName', 'email', 'photos'], // Lấy thông tin từ Facebook
      },
      async (accessToken, refreshToken, profile, done) => {
          try {
              // Kiểm tra hoặc lưu user vào cơ sở dữ liệu
              let user = await AccountModal.findOne({ facebookId: profile.id });

              if (!user) {
                  // Nếu user chưa tồn tại, tạo mới
                  user = await AccountModal.create({
                      facebookId: profile.id,
                      name: profile.displayName || 'Unknown',
                      email: profile.emails?.[0]?.value || null,
                      image: profile.photos?.[0]?.value || "https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png",
                  });
              }

              // Trả user về cho Passport
              return done(null, user);
          } catch (err) {
              console.error('Lỗi trong Facebook Strategy:', err.message);
              return done(err, null);
          }
      }
  )
);

// Serialize user (lưu thông tin user vào session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (tìm thông tin user từ session)
passport.deserializeUser(async (id, done) => {
  try {
      const user = await AccountModal.findById(id);
      done(null, user);
  } catch (err) {
      console.error('Lỗi khi deserialize user:', err.message);
      done(err, null);
  }
});
module.exports = passport;