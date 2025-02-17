import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import os from 'os';
import db from '../models/index.js';
import User from '../models/user.js';
import School from '../models/school.js';
import smtpTransport from '../config/verify.js';

const hostname = os.hostname();
const PORT = process.env.PORT || 3000;

const router = express.Router();

// REGEX Function for autocomplete
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

router.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.originalUrl}`,
    req.method === 'POST' ? req.body : '',
  );
  next();
});

// HTML route for signup page
router.get('/signup', async (req, res) => {
  console.log('Rendering signup page');
  res.render('signup', {
    title: 'Registration Page',
    school: 'Make Art, Have Fun!',
    logged: req.isAuthenticated(),
  });
});

// Signup test route
router.get('/api/signup/test', (req, res) => {
  res.json({
    message: 'Signup endpoint is reachable',
    time: new Date().toISOString(),
  });
});

// ROUTE TO SIGNUP A NEW USER
router.get('/signup', async (req, res) => {
  console.log('Rendering signup page');
  res.render('signup', {
    title: 'Registration Page',
    school: 'Make Art, Have Fun!',
    logged: req.isAuthenticated(),
  });
});

// API route for signup
router.post('/api/signup', (req, res, next) => {
  console.log('Received signup request');

  // Single response tracking
  let hasResponded = false;
  const sendResponse = (status, data) => {
    if (hasResponded) {
      console.log('Prevented duplicate response:', status, data);
      return;
    }
    hasResponded = true;
    res.status(status).json(data);
  };

  // Validate request body
  if (!req.body || !req.body.email || !req.body.password) {
    console.log('Invalid request body');
    return sendResponse(400, {
      success: false,
      message: 'Email and password are required',
    });
  }

  // Use passport authentication
  passport.authenticate('local-signup', (err, user, info) => {
    console.log('Passport authenticate callback');

    if (err) {
      console.error('Authentication error:', err);
      return sendResponse(500, {
        success: false,
        message: 'Error during signup process',
      });
    }

    if (!user) {
      console.log('No user created:', info);
      return sendResponse(400, {
        success: false,
        message: info?.message || 'Signup failed',
      });
    }

    // Log in the user
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return sendResponse(500, {
          success: false,
          message: 'Error logging in after signup',
        });
      }

      // Set cookies after successful login
      try {
        res.cookie('first_name', user.first_name);
        res.cookie('user_id', user.id);

        // Send appropriate response based on user status
        if (!user.active) {
          console.log('User needs verification');
          return sendResponse(200, {
            success: true,
            redirect: '/send',
            message: 'Please check your email for verification',
          });
        }

        console.log('Signup successful');
        return sendResponse(200, {
          success: true,
          redirect: '/dashboard',
          message: 'Registration successful',
        });
      } catch (error) {
        console.error('Error completing signup:', error);
        return sendResponse(500, {
          success: false,
          message: 'Error completing registration',
        });
      }
    });
  })(req, res, next);
});

// Route for post signup Verification
router.get('/send', async (req, res) => {
  console.log('Send route accessed');
  console.log('signup_controller Email Verification Send route', req.session.passport.user);

  if (!req.isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return res.redirect('/login');
  }

  try {
    console.log('User info:', req.user);

    const user = {
      userInfo: req.user,
      id: req.session.passport.user,
      school: req.user.school,
      secretToken: req.user.secretToken,
      isloggedin: req.isAuthenticated(),
    };

    // Construct verification link
    console.log('Construct Verification Link - User.Info:', user.userInfo);
    console.log('os.hostname(): ', os.hostname());
    const hostname = os.hostname();
    const link = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? `http://${hostname}:${process.env.PORT}/verify?id=${user.secretToken}`
      : `https://silentauctiongallery.herokuapp.com/verify?id=${user.secretToken}`;

    console.log('Verification link:', link);

    // Configure email options
    const mailOptions = {
      from: '"Silent Auction Gallery" <silentauctiongallery@gmail.com>',
      to: req.user.email,
      subject: 'Silent Auction Gallery - Email Verification',
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml"><head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=Edge">
      <style type="text/css">
    html {
      background-image: url(https://cdn.jsdelivr.net/gh/deawar/SAG-MongoDB@main/public/resources/backgroundImage.png);
      -webkit-background-size: cover;
      -moz-background-size: cover;
      -o-background-size: cover;
      background-size: cover;
    }
    body, p, div {
      font-family: inherit;
      font-size: 14px;
    }
    body {
      color: #000000;
    }
    body a {
      color: #1188E6;
      text-decoration: none;
    }
    p { margin: 0; padding: 0; }
    table.wrapper {
      width:100% !important;
      table-layout: fixed;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -moz-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    img.max-width {
      max-width: 100% !important;
    }
    .column.of-2 {
      width: 50%;
    }
    .column.of-3 {
      width: 33.333%;
    }
    .column.of-4 {
      width: 25%;
    }
    @media screen and (max-width:480px) {
      .preheader .rightColumnContent,
      .footer .rightColumnContent {
        text-align: left !important;
      }
      .preheader .rightColumnContent div,
      .preheader .rightColumnContent span,
      .footer .rightColumnContent div,
      .footer .rightColumnContent span {
        text-align: left !important;
      }
      .preheader .rightColumnContent,
      .preheader .leftColumnContent {
        font-size: 80% !important;
        padding: 5px 0;
      }
      table.wrapper-mobile {
        width: 100% !important;
        table-layout: fixed;
      }
      img.max-width {
        height: auto !important;
        max-width: 100% !important;
      }
      a.bulletproof-button {
        display: block !important;
        width: auto !important;
        font-size: 80%;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .columns {
        width: 100% !important;
      }
      .column {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
    }
  </style>
      <link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet"><style>
body {font-family: 'Muli', sans-serif;}
</style>
    </head>
    <body>
      <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
        <div class="webkit">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
            <tbody><tr>
              <td valign="top" bgcolor="#FFFFFF" width="100%">
                <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                  <tbody><tr>
                    <td width="100%">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tbody><tr>
                          <td>
                            <!--[if mso]>
    <center>
    <table><tr><td width="600">
  <![endif]-->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                      <tbody><tr>
                                        <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
    <tbody><tr>
      <td role="module-content">
        <p></p>
      </td>
    </tr>
  </tbody></table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#f6f6f6">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table class="column" width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="72aac1ba-9036-4a77-b9d5-9a60d9b05cba">
    <tbody>
      <tr>
        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
          <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="240" alt="" data-proportionally-constrained="true" data-responsive="false" src="https://cdn.jsdelivr.net/gh/deawar/SAG-MongoDB@main/public/resources/SAGL.png">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="331cde94-eb45-45dc-8852-b7dbeb9101d7">
    <tbody>
      <tr>
        <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="">
        </td>
      </tr>
    </tbody>
  </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="d8508015-a2cb-488c-9877-d46adf313282">

  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="27716fe9-ee64-4a64-94f9-a4f28bc172a0">
    <tbody>
      <tr>
        <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
    <tbody>
      <tr>
        <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 43px">Thanks for signing up!&nbsp;</span></div><div></div></div></td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
    <tbody>
      <tr>
        <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px">Please verify your email address to</span><span style="color: #000000; font-size: 18px; font-family: arial,helvetica,sans-serif"> get access to auctions of student artwork for ${user.school}</span><span style="font-size: 18px">.</span></div>
<div style="font-family: inherit; text-align: center"><span style="color: #0011ff; font-size: 18px"><strong>Thank you!&nbsp;</strong></span></div><div></div></div></td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
    <tbody>
      <tr>
        <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
    <tbody>
      <tr>
        <td style="padding:0px 0px 50px 0px;" role="module-content" bgcolor="#ffffff">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a265ebb9-ab9c-43e8-9009-54d6151b1600" data-mc-module-version="2019-10-22">
    <tbody>
      <tr>
        <td style="padding:50px 30px 50px 30px; line-height:22px; text-align:inherit; background-color:#6e6e6e;" height="100%" valign="top" bgcolor="#6e6e6e" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px"><strong>Here’s what happens next:</strong></span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">Copy this token:<br><b>${user.secretToken}</b><br><br>You will paste it into the Verification page at the link below that will show up when you click the Veriy Email button. Once the codes are confirmed we'll mark your account as verified and you will be ready to Bid!</span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1">
  <tbody>
    <tr>
      <td align="center" bgcolor="#6e6e6e" class="outer-td" style="padding:0px 0px 0px 0px;">
        <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
          <tbody>
            <tr>
            <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
              <a href=${link} style="background-color:#b71c1c; border:1px solid #b71c1c; border-color:#b71c1c; border-radius:0px; border-width:1px; color:#ffffff; display:inline-block; font-size:16px; font-weight:bold; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Verify Email Now</a>
              <div itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler">
                <link itemprop="url" href="${link}"/></div>
            </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">Need support? Our support team is always</span></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">ready to help!&nbsp;</span></div><div></div></div></td>
      </tr>
    </tbody>
  </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1.1">
      <tbody>
        <tr>
          <td align="center" bgcolor="#6e6e6e" class="outer-td" style="padding:0px 0px 0px 0px;">
            <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
              <tbody>
                <tr>
                <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                  <a href="" style="background-color:#ffbe00; border:1px solid #ffbe00; border-color:#ffbe00; border-radius:0px; border-width:1px; color:#000000; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Contact Support</a>
                </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
    <tbody>
      <tr>
        <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="6E6E6E">
        </td>
      </tr>
    </tbody>
  </table></td>
              </tr>
            </tbody>
          </table>
          
        </td>
      </tr>
    </tbody>
  </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
                                            <div class="Unsubscribe--addressLine"><p class="Unsubscribe--senderName" style="font-size:12px; line-height:20px;">Silent Auction Gallery</p><p style="font-size:12px; line-height:20px;"><span class="Unsubscribe--senderCity">Statham</span>, <span class="Unsubscribe--senderState">GA</span> <span class="Unsubscribe--senderZip">30666</span></p></div>
                                            <p style="font-size:12px; line-height:20px;"><a>Unsubscribe - This is a one time email solely for the purposes of verifing your email address.</a></p>
                                          </div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="550f60a9-c478-496c-b705-077cf7b1ba9a">
      <tbody>
        <tr>
          <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
            <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
              <tbody>
                <tr>
                <td align="center" bgcolor="#f5f8fd" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a href="https://sendgrid.com/" style="background-color:#f5f8fd; border:1px solid #f5f8fd; border-color:#f5f8fd; border-radius:25px; border-width:1px; color:#a8b9d5; display:inline-block; font-size:10px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:5px 18px 5px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">♥ POWERED BY TWILIO SENDGRID</a></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table></td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody></table>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
          </tbody></table>
        </div>
      </center>
</body>
<script type="application/ld+json">
{
  "@context": "https://silentauctiongallery.herokuapp.com/",
  "@type": "EmailMessage",
  "potentialAction": {
    "@type": "ConfirmAction",
    "name": "Approve Expense",
    "handler": {
      "@type": "HttpActionHandler",
      "url": "https://silentauctiongallery.herokuapp.com/verify?id=${secretToken}"
    }
  },
  "description": "Email Verification for Silent Auction Gallery"
}
</script>
</html>`,
    };

    // Send email
    console.log('Sent by:', process.env.GMAIL_USERNAME);
    console.log('In Sentmail signup_controller.js: ', mailOptions);
    await smtpTransport.sendMail(mailOptions);
    console.log('Verification email sent successfully');

    // Render verification page
    res.render('verify', {
      title: 'Verify Email',
      email: req.user.email,
      secretToken: user.secretToken,
    });
  } catch (error) {
    console.error('Error in send route:', error);
    res.status(500).render('error', {
      message: 'Error sending verification email',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// ROUTE FOR PRIVACY POLICY
router.get('/privacypolicy', (req, res) => {
  res.render('privacypolicy', {
    title: 'Privacy Policy Page',
    school: 'Make Art, Have Fun!',
  });
});

// ROUTE TO AUTOCOMPLETE SCHOOL NAME FROM DB
const schoolname = School.find({});
router.get('/autocomplete', (req, res, next) => {
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q, 'i'));
    const mysearch = req.query.q;
    console.log('regex: ', regex);
    console.log('mysearch: ', mysearch);
    // let findSchool =
    // schoolname.find({ SchoolName: { $regex: regex, $options: 'i' } }, function (err, data) {
    schoolname.find(
      { SchoolName: { $regex: regex, $options: 'i' } },
      (err, data) => {
        const result = [];
        if (!err) {
          if (data && data.length && data.length > 0) {
            data.forEach((schoolsearch) => {
              const obj = {
                id: schoolsearch._id,
                school: schoolsearch.SchoolName[0],
                college_board_id: schoolsearch.CollegeBoardID,
              };
              console.log('obj: ', obj);
              result.push(obj);
            });
          }
          res.jsonp(result);
        } else {
          console.log(err);
        }
        console.log('LINE 59================================>OutPut of find(): ', result);
      },
    );
  }
});

// Email verification
// let mailOptions;
let link;
// let secretToken;
// user.value.secretToken = secretToken;
// user.value.active = false; // Flag account as inactive until verified
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// router.post('/send', async (req, res) => {
//   console.log('Line 84 in signup_controller Email Verification Send route', req.session.passport.user);
//   if (!req.isAuthenticated()) {
//     return res.redirect('/login');
//   }
//   try {
//     const user = {
//       userInfo: req.user,
//       id: req.session.passport.user,
//       school: req.user.school,
//       secretToken: req.user.secretToken,
//       isloggedin: req.isAuthenticated(),
//     };
//     console.log('Line 98 User.Info:', user.userInfo);
//     console.log('Line 99 os.hostname(): ', os.hostname());
//     res.send(user.secretToken);
//     secretToken = user.secretToken;
//     const { school } = user;

//     // Construct verification link
//     const hostname = os.hostname();
//     const link = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
//       ? `http://${hostname}:${process.env.PORT}/verify?id=${user.secretToken}`
//       : `https://silentauctiongallery.herokuapp.com/verify?id=${user.secretToken}`;
//     // if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
//     //   link = `http://${hostname}:${PORT}/verify?id=${secretToken}`;
//     // } else {
//     //   // eslint-disable-next-line prefer-template
//     //   link = 'https://silentauctiongallery.herokuapp/com/verify?id=' + secretToken;
//     //   // link = `http://${req.get(host)}/verify?id=${rand}`;
//     // }
//     console.log('Verify Return Link: ', link);
//     // Configure email options
//     const mailOptions = {
//       from: '"Silent Auction Gallery" <silentauctiongallery@gmail.com>',
//       to: req.body.to,
//       subject:
//             'Silent Auction Gallery is asking you to confirm your Email account',
//       // eslint-disable-next-line prefer-template
//     };
//     console.log('Sent by:', process.env.GMAIL_USERNAME);
//     console.log('Line 413 signup_controller.js: ', mailOptions);

//     await smtpTransport.sendMail(mailOptions);
//     console.log('Email sent successfully');
//   } catch (error) {
//     console.error('Error in send route:', error);
//     res.status(500).json({ message: 'Error sending verification email' });
//   }
// });

// Find secretToken to compare from DB
async function findOnebySecretToken(req, res, secretTokenPasted, done) {
  const user = User.findOne(
    { user: secretToken },
    (err, data) => {
      if (err) {
        return done(err);
      }
      console.log('Signup_controller Line 533 data: ', data);
      // const user = data;
      return done(null, user);
    },
  );
  if (!user.secretToken || user.active === true || user.secretToken === ' ') {
    req.flash('success', 'You have either already confirmed your account OR you may need to register');
    return res.status(404).redirect('/signup', { title: 'Register Page' });
  }
  console.log('Line 542------->User db output user.dataValues.secretToken:', user.dataValues.secretToken);
  console.log('line 543 ------>User db active output user.dataValues.active:', user.dataValues.active);

  if (user.secretToken === secretTokenPasted) {
    console.log(
      'Domain is matched. Information is from Authentic email. secretToken:',
      req.query.id === secretToken,
    );
    console.log('email is verified');
    console.log('In Verify Route and user: ', user);
    if (!user) {
      console.log('*****************User NOT Found!!!****************');
      // res.;
      req.flash('Error, No user found.');
      res.status(401).redirect('/signup');
      return;
    }
    const condition = {
      where: {
        secretToken: secretTokenPasted,
      },
    };
    console.log('Condition----->: ', condition);
    const removed = await db.User.updateOne(
      condition,
      {
        secretToken: null,
        active: true,
      },
      (err, result) => {
        console.log('============>', result);
        if (err) {
          return done(err);
        }
        if (removed.active === true) {
          req.flash('You have either already confirmed your account OR you may need to register', 'I did NOT find you in our database.');
          return res.status(404).end();
        }
        req.flash('Success', 'Thank you! Now you can Login.');
        res.redirect('/login').status(200);
      },
    );

    req.flash('Success', 'Thank you! Now you can Login.');
    res.redirect('/signup');
  } else {
    req.flash('Success', 'Thank you! Now you can Login.');
    res.redirect('/login');
  }
}

router
  // eslint-disable-next-line no-unused-vars
  .get('/verify', (req, res, next) => {
    console.log('<----------------------------------Res.body: ', res.url);
    res.render('verifytoken', { title: 'Verify Email Page' });
  })
  .post('/verify', async (req, res, next) => {
  //   try {
  //     secretToken = req.body.secretToken;

    //     console.log('Line 515 ----->secretToken:', secretToken);
    //     // Find account with matching secret Token
    //     console.log('signup_controller Line 517 prior to findOnebySecretToken fx', secretToken);
    //     const filter = { secretToken };
    //     console.log('line 520 secretToken null ck: ', secretToken);
    //     console.log('line 521 filter null ck: ', filter);
    //     const update = { secretToken: '', active: true };
    //     console.log('line 523 update null ck: ', update);
    //     User.findOne(filter, (err, user) => {
    //       console.log('line 525 user null ck: ', user.secretToken);
    //       console.log('line 526 req.body: ', req.body.secretToken);
    //       if (user.secretToken === secretToken) {
    //         console.log('Tokens match- Verify this user.');
    //         User.findOneAndUpdate(filter, update, { new: true }, (err, resp) => {
    //           if (err) {
    //             throw err;
    //           } else {
    //             console.log('User has been verified in DB!', resp);
    //             // res.redirect('/login');
    //           }
    //         });
    //         res.redirect('/login');
    //       } else {
    //         console.log('secretToken did not match. Suer is rejected. Token should be: ', user.local.secretToken);
    //       }
    //     });
    //   } catch (error) {
    //     throw new Error('BROKEN-DID NOT CATCH THE NULL VALUE', error);
    //     // eslint-disable-next-line no-unreachable
    //     next(error);
    //   }
    // });
    try {
      const { secretToken } = req.body;

      if (!secretToken) {
        return res.status(400).json({ success: false, message: 'Secret token is required' });
      }

      // Find user by secretToken
      const user = await User.findOne({ secretToken });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Invalid or expired token' });
      }

      // Update the user: set active to true and remove the secretToken
      user.active = true;
      user.secretToken = null;
      await user.save();

      return res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      console.error('Verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  });
export default router;
