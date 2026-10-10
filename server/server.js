require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
const Flutterwave = require("flutterwave-node-v3");

const app = express();

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const HERO_API_KEY = process.env.HERO_API_KEY;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "OGSMS <support@getogsms.com>";
const APP_BASE_URL = (process.env.APP_BASE_URL || "https://testing-ogsms-src.vercel.app").replace(/\/$/, "");

async function sendResendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email was not sent.");
    return false;
  }

  await axios.post(
    "https://api.resend.com/emails",
    {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    },
    {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  return true;
}

async function sendWelcomeEmail(user) {
  if (!user?.email) return false;

  const name = user.fullName || "there";
  return sendResendEmail({
    to: user.email,
    subject: "Welcome back to OGSMS",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#17323a">
        <div style="background:#0B4F63;color:#fff;padding:22px;border-radius:16px 16px 0 0">
          <h1 style="margin:0;font-size:26px">Welcome back to OGSMS</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px">
          <p>Hello ${escapeHtml(name)},</p>
          <p>You have successfully signed in to your OGSMS account.</p>
          <p>If this sign-in was not you, please change your password immediately.</p>
          <a href="${APP_BASE_URL}/dashboard.html" style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Open OGSMS</a>
        </div>
      </div>`
  });
}

async function sendRegistrationWelcomeEmail(user) {
  if (!user?.email) return false;

  const name = user.fullName || "there";
  return sendResendEmail({
    to: user.email,
    subject: "Welcome to OGSMS",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#17323a">
        <div style="padding-bottom:18px;border-bottom:1px solid #e5e7eb">
          <div style="font-size:24px;font-weight:800;color:#0B4F63">OGSMS</div>
        </div>
        <div style="padding:28px 4px">
          <h1 style="margin:0 0 12px;font-size:26px;color:#0B4F63">Welcome to OGSMS, ${escapeHtml(name)}</h1>
          <p style="font-size:15px;line-height:1.7;color:#52636B">Your account has been created successfully. You can now fund your wallet, purchase foreign numbers and manage incoming SMS from your OGSMS dashboard.</p>
          <a href="${APP_BASE_URL}/dashboard.html" style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;margin-top:10px">Open OGSMS</a>
        </div>
        <p style="font-size:12px;color:#8a969b">If you did not create this account, please contact OGSMS support.</p>
      </div>`
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendPasswordResetEmail(user, resetUrl) {
  const name = user.fullName || "there";
  return sendResendEmail({
    to: user.email,
    subject: "Reset your OGSMS password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#17323a">
        <div style="background:#0B4F63;color:#fff;padding:22px;border-radius:16px 16px 0 0">
          <h1 style="margin:0;font-size:26px">Password Reset</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px">
          <p>Hello ${escapeHtml(name)},</p>
          <p>We received a request to reset your OGSMS password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Reset Password</a>
          <p style="margin-top:20px;font-size:13px;color:#6b7280">If you did not request this, you can safely ignore this email.</p>
        </div>
      </div>`
  });
}


// ======================
// MIDDLEWARE
// ======================

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the OGSMS frontend assets during development.
app.use(express.static(path.join(__dirname, "../src")));



// ======================
// CONNECT MONGODB
// ======================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI is not set. Add it to server/.env before starting OGSMS.");
}

mongoose.connect(MONGODB_URI)

.then(() => {

  console.log(
    "MongoDB Connected"
  );

})

.catch((err) => {

  console.log(err);

});


// ======================
// USER SCHEMA
// ======================
// ======================
// USER SCHEMA + MODEL
// ======================

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    balance: { type: Number, default: 0 },
    phoneNumber: { type: String, default: "" },
    processedTxIds: { type: [String], default: [] },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema); // ✅ THIS WAS MISSING
// ======================
// PRICING SCHEMA + MODEL
// ======================

const pricingSchema = new mongoose.Schema({

    country: String,

    service: String,

    price: Number,

    active: {
        type: Boolean,
        default: true
    }

});

const Pricing = mongoose.model("Pricing", pricingSchema);

// ======================
// NUMBER SCHEMA + MODEL
// ======================

const numberSchema = new mongoose.Schema({
  userEmail: String,
  number: String,
  orderId: String,
  service: String,
  price: Number,
  status: { type: String, default: "pending" },
  smsCode: String,
  createdAt: { type: Date, default: Date.now }
});

const PurchasedNumber = mongoose.model("PurchasedNumber", numberSchema);



const paymentSchema = new mongoose.Schema({
    customer: String,
    amount: Number,
    transactionId: String,
    reference: String,
    method: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

// ======================
// ADMIN SCHEMA + MODEL
// ======================

const adminSchema = new mongoose.Schema({

    username: String,

    password: String

});

const Admin = mongoose.model("Admin", adminSchema);



// ======================
// REGISTER
// ======================

app.post(
  "/register",
  async (req, res) => {

    try {

      const {
        fullName,
        email,
        password,
        phoneNumber
      } = req.body;

      const existingUser =
      await User.findOne({
        email
      });

      if(existingUser){

        return res.json({

          success: false,

          message:
          "User already exists"

        });

      }

      const newUser =
      new User({

        fullName,
        email: String(email || "").trim().toLowerCase(),
        password,
        phoneNumber: String(phoneNumber || "").trim(),

        balance: 0

      });

      await newUser.save();

      // Send the registration welcome email without blocking account creation.
      sendRegistrationWelcomeEmail(newUser).catch(emailError => {
        console.log("REGISTRATION WELCOME EMAIL ERROR:", emailError.response?.data || emailError.message);
      });

      res.json({

        success: true,

        message:
        "Registration Successful"

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false,

        message:
        "Server Error"

      });

    }

  }
);


// ======================
// FORGOT PASSWORD
// ======================

app.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.json({ success: false, message: "Email address is required." });
    }

    const user = await User.findOne({ email });

    // Do not reveal whether an account exists.
    const genericMessage = "If an account exists for that email, a password reset link has been sent.";

    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${APP_BASE_URL}/reset-password.html?token=${encodeURIComponent(resetToken)}`;

    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (emailError) {
      console.error("RESET EMAIL ERROR:", emailError.response?.data || emailError.message);
      // Remove the token if delivery failed so a broken reset link is not left active.
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();
      return res.status(500).json({ success: false, message: "Unable to send the reset email right now. Please try again." });
    }

    return res.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ======================
// RESET PASSWORD
// ======================

app.post("/reset-password", async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const password = String(req.body.password || "");

    if (!token || password.length < 6) {
      return res.json({ success: false, message: "Invalid reset request or password." });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.json({ success: false, message: "This reset link is invalid or has expired." });
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ======================
// LOGIN
// ======================

app.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;

      const user =
      await User.findOne({

        email,
        password

      });

      if(!user){

        return res.json({

          success: false,

          message:
          "Invalid Email or Password"

        });

      }

      // Send a welcome-back email after every successful sign-in.
      // Do not block login if email delivery fails.
      sendWelcomeEmail(user).catch(emailError => {
        console.log("WELCOME EMAIL ERROR:", emailError.response?.data || emailError.message);
      });

      res.json({

        success: true,

        user: {

          fullName:
          user.fullName,

          email:
          user.email,

          phoneNumber:
          user.phoneNumber || "",

          balance:
          user.balance

        }

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);


// ======================
// GET USER
// ======================

app.post(
  "/get-user",
  async (req, res) => {

    try {

      const email =
      req.body.email;

      const user =
      await User.findOne({
        email
      });

      if(!user){

        return res.json({

          success: false

        });

      }

      res.json({

        success: true,

        user: {

          fullName:
          user.fullName,

          email:
          user.email,

          balance:
          user.balance

        }

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);



// ======================
// UPDATE WALLET
// ======================
// ======================
// UPDATE WALLET
// ======================
app.post("/update-wallet", async (req, res) => {
  console.log("🔑 SECRET KEY:", process.env.FLW_SECRET_KEY ? "✅ FOUND" : "❌ MISSING");

  const { email, amount, transaction_id } = req.body;

  console.log("📥 UPDATE WALLET HIT");
  console.log("EMAIL:", email);
  console.log("AMOUNT:", amount);
  console.log("TRANSACTION ID:", transaction_id);

  if (!email || !transaction_id) {
    return res.json({ success: false, message: "Invalid request" });
  }

  try {
    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    );

    console.log("🔥 FLW VERIFY STATUS:", verifyRes.data?.data?.status);

    if (!verifyRes.data?.data || verifyRes.data?.data?.status !== "successful") {
      return res.json({ success: false, message: "Payment not successful" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.processedTxIds.includes(String(transaction_id))) {
      return res.json({ success: false, message: "Already processed" });
    }

    user.balance += Number(amount);
    user.processedTxIds.push(String(transaction_id));
    await user.save();

   const payment = new Payment({
    customer: email,
    amount: Number(amount),
    transactionId: transaction_id,
    reference: verifyRes.data.data.tx_ref,
    method: "Flutterwave",
    status: "Successful"
});

await payment.save();


    return res.json({ success: true, balance: user.balance });

  } catch (error) {
    console.log("❌ ERROR:", error.response?.data || error.message);
    return res.json({ success: false, message: error.response?.data?.message || error.message });
  }
});

const heroServiceCodes = {
    facebook: "fb",
    whatsapp: "wa",
    telegram: "tg",
    google: "go",
    gmail: "go",
    youtube: "go",
    instagram: "ig",
    tiktok: "lf",
    paypal: "ts"
};
const heroCountryCodes = {
    usa: 187,
    canada: 36,
    uk: 16,
    "south africa": 1,
    indonesia: 6
};


// ======================
// BUY NUMBER
// ======================

app.post(
  "/buy-number",
  async (req, res) => {

    let user;
    let sellingPrice = 0;

    

    try {

      const email =
      req.body.email;

      const country =
      req.body.country;

      const service =
      req.body.service;

      const pricing = await Pricing.findOne({

    country: country.toLowerCase(),

    service: service.toLowerCase(),

    active: true

});

if (!pricing) {

    return res.json({

        success: false,

        message: "Price not configured"

    });

}

sellingPrice = pricing.price;

      console.log("Country:", country);
console.log("Service:", service);



   
       user =
      await User.findOne({

        email

      });

      if(!user){

        return res.json({

          success: false,

          message:
          "User not found"

        });

      }


console.log("Database Balance:", user.balance);
console.log("Selling Price:", sellingPrice);
      
      
 // CHECK BALANCE

      if(user.balance < sellingPrice){

        return res.json({

          success: false,

          message:
          "Insufficient Balance"

        });

      }

      // REMOVE MONEY

      user.balance =
      user.balance - sellingPrice;

      await user.save();


      // BUY FROM 5SIM
     
 
 console.log(country);
console.log(service);  


  console.log("SERVICE SENT:", heroServiceCodes[service.toLowerCase()] || service);
console.log("COUNTRY SENT:", heroCountryCodes[country.toLowerCase()] || country);

    const buyResponse = await axios.get(
    "https://hero-sms.com/stubs/handler_api.php",
    {
        params: {
            action: "getNumberV2",
            api_key: HERO_API_KEY,
            service: heroServiceCodes[service.toLowerCase()] || service,
            country: heroCountryCodes[country.toLowerCase()] || country
        }
    }
);
      console.log("BUY RESPONSE:");
console.log(JSON.stringify(buyResponse.data, null, 2));

      
     



     if (!buyResponse.data.phoneNumber) {

  // REFUND USER
  user.balance =
  user.balance + sellingPrice;

  await user.save();

  return res.json({

    success:false,

    message:
`${country.toUpperCase()} ${service} numbers are temporarily unavailable. Your wallet has been refunded. Please try again in a few minutes.`

  });

}

     const generatedNumber = buyResponse.data.phoneNumber;

const orderId = buyResponse.data.activationId;
      const realPrice =
      buyResponse.data.price || 0;

     


      

      // SAVE PURCHASE

      const newPurchase =
      new PurchasedNumber({

        userEmail:
        user.email,

        number:
        generatedNumber,

        orderId:
        orderId,

        service:
        service,

        price:
        sellingPrice

      });

      await newPurchase.save();

      res.json({

        success: true,

        number:
        generatedNumber,

        balance:
        user.balance,

        price:
        sellingPrice

      });

    }

    catch(error){

  // REFUND USER
  if(user){

    user.balance =
    user.balance + sellingPrice;

    await user.save();

  }

  console.log(
    error.response?.data ||
    error.message
  );

  res.json({

    success: false,

    message:
    "Failed to buy number"

  });

}

  }
);

app.post(
"/cancel-number",
async (req, res) => {

try {

  const {
    email,
    orderId,
    price
  } = req.body;

  const user =
  await User.findOne({
    email
  });

  if(!user){

    return res.json({

      success:false,

      message:"User not found"

    });

  }
  
  console.log("Cancelling order:", orderId);

  console.log("Order ID from MongoDB:", orderId);
console.log("Type:", typeof orderId);

  const response = await axios.get(
  "https://hero-sms.com/stubs/handler_api.php",
  {
    params: {
      action: "cancelActivation",
      api_key: HERO_API_KEY,
      id: orderId
    }
  }
);

console.log("Hero Cancel:", response.data);

  const purchase = await PurchasedNumber.findOne({ orderId });

if (!purchase) {
  return res.json({
    success: false,
    message: "Order not found"
  });
}

if (purchase.status !== "pending") {
  return res.json({
    success: false,
    message: "This number can no longer be cancelled."
  });
}
 

  user.balance =
  user.balance + Number(price);

  await user.save();

  await PurchasedNumber.findOneAndUpdate(
  { orderId },
  { status: "cancelled" }
);

  res.json({

    success:true,

    balance:user.balance

  });

}

catch(error){

  console.log("===== CANCEL ERROR =====");
  console.log(error.response?.status);
  console.log(error.response?.data);
  console.log(error.message);

  res.json({
    success:false,
    message:"Refund failed"
  });

}

}
);

// ======================
// AUTO REFUND
// ======================

app.get("/auto-refund", async (req, res) => {

  try {

    const purchases = await PurchasedNumber.find({
      status: "pending"
    });

    let refunded = 0;

    for (const purchase of purchases) {

      const minutes =
        (Date.now() - new Date(purchase.createdAt).getTime()) / 60000;

      if (minutes >= 10) {

        const user = await User.findOne({
          email: purchase.userEmail
        });

        if (!user) {
          continue;
        }

        user.balance += purchase.price;

        await user.save();

        purchase.status = "cancelled";

        await purchase.save();

        refunded++;

      }

    }

    res.json({

      success: true,

      pendingOrders: purchases.length,

      refunded

    });

  }

  catch(error){

    console.log(error);

    res.json({

      success: false

    });

  }

});






// ======================
// GET LIVE PRICE
// ======================



   // ======================
// GET PRICE FROM DATABASE
// ======================

app.post("/get-price", async (req, res) => {

    try {

        const { country, service } = req.body;

        const pricing = await Pricing.findOne({

            country: country.toLowerCase(),

            service: service.toLowerCase(),

            active: true

        });

        if (!pricing) {

            return res.json({

                success: false,

                message: "Price not configured"

            });

        }

        res.json({

            success: true,

            price: pricing.price

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false

        });

    }

});


// ======================
// GET SMS
// ======================



   app.post("/get-sms", async (req, res) => {
  try {

    const { orderId } = req.body;

    // Check database first
    const purchase = await PurchasedNumber.findOne({ orderId });

    if (!purchase) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    // If code already saved, return it
    if (purchase.smsCode) {
      return res.json({
        success: true,
        sms: purchase.smsCode
      });
    }

    const response = await axios.get(
      "https://hero-sms.com/stubs/handler_api.php",
      {
        params: {
          action: "getStatus",
          api_key: HERO_API_KEY,
          id: orderId
        }
      }
    );

    const status = response.data;

    console.log("Hero SMS:", status);

    if (status.startsWith("STATUS_OK:")) {

      const code = status.split(":")[1];

      purchase.status = "successful";
      purchase.smsCode = code;

      await purchase.save();

      return res.json({
        success: true,
        sms: code
      });
    }

    return res.json({
      success: false,
      message: status
    });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.json({
      success: false
    });

  }
});


// ======================
// PURCHASE HISTORY
// ======================

app.post(
  "/purchase-history",
  async (req, res) => {

    try {

      const email =
req.body.email;

console.log("PURCHASE HISTORY EMAIL:", email);

const purchases =
await PurchasedNumber.find({

  userEmail:
  email

}).sort({

  createdAt: -1

});

console.log("PURCHASES FOUND:", purchases);
console.log(JSON.stringify(purchases, null, 2));

res.json({

  success: true,

  purchases

});

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);


// ======================
// ADMIN DASHBOARD
// ======================

app.get("/admin/dashboard", async (req, res) => {

    try {

        const totalUsers = await User.countDocuments();

        const numbersSold = await PurchasedNumber.countDocuments();

        const pendingOrders = await PurchasedNumber.countDocuments({
            status: "pending"
        });

        const cancelledOrders = await PurchasedNumber.countDocuments({
            status: "cancelled"
        });

        const revenueResult = await PurchasedNumber.aggregate([
  {
    $match: {
      status: "successful"
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: {
        $sum: "$price"
      }
    }
  }
]);

const totalRevenue =
  revenueResult.length > 0
    ? revenueResult[0].totalRevenue
    : 0;

    const walletResult = await User.aggregate([
  {
    $group: {
      _id: null,
      totalWallet: {
        $sum: "$balance"
      }
    }
  }
]);

const totalWallet =
walletResult.length > 0
? walletResult[0].totalWallet
: 0;


       res.json({
  success: true,
  totalUsers,
  numbersSold,
  pendingOrders,
  cancelledOrders,
  totalRevenue,
  totalWallet
});

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

app.get("/admin/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("fullName email balance createdAt")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });

    } catch (err) {
        console.log(err);

        res.json({
            success: false
        });
    }
});

// ======================
// SERVER
// ======================

 const PORT = process.env.PORT || 5000;

 // ======================
// ADMIN RECENT PURCHASES
// ======================

app.get("/admin/recent-purchases", async (req, res) => {

  try {

    const purchases = await PurchasedNumber.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      purchases
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false
    });

  }

});

app.get("/admin/payments", async (req, res) => {

    try {

        const payments = await Payment.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

// ======================
// USER PAYMENT HISTORY
// ======================

app.post("/payment-history", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.json({
                success: false,
                message: "Email is required"
            });
        }

        const payments = await Payment.find({
            customer: email
        })
        .sort({
            createdAt: -1
        })
        .limit(20);

        res.json({
            success: true,
            payments
        });

    } catch (error) {

        console.log("PAYMENT HISTORY ERROR:", error);

        res.json({
            success: false,
            message: "Failed to load transaction history"
        });

    }

});



// ======================
// ADMIN ADD / UPDATE PRICE
// ======================

app.post("/admin/save-price", async (req, res) => {

    try {

        const { country, service, price } = req.body;

        let pricing = await Pricing.findOne({
            country,
            service
        });

        if (pricing) {

            pricing.price = Number(price);
            await pricing.save();

        } else {

            pricing = new Pricing({
                country,
                service,
                price: Number(price)
            });

            await pricing.save();

        }

        res.json({
            success: true,
            pricing
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

// ======================
// ADMIN GET PRICES
// ======================

app.get("/admin/prices", async (req, res) => {

    try {

        const prices = await Pricing.find().sort({
            country: 1,
            service: 1
        });

        res.json({
            success: true,
            prices
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

app.delete("/admin/delete-price/:id", async (req, res) => {

    try {

        await Pricing.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});


// ======================
// GET AVAILABLE COUNTRIES
// ======================

app.get("/countries", async (req, res) => {

    try {

        const countries = await Pricing.distinct("country", {
            active: true
        });

        res.json({
            success: true,
            countries
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});


// ======================
// ADMIN LOGIN
// ======================

app.post("/admin/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const admin = await Admin.findOne({
            username,
            password
        });

        if (!admin) {

            return res.json({
                success: false,
                message: "Invalid Admin Login"
            });

        }

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});



// ======================
// CREATE FIRST ADMIN
// ======================
// ======================
// FLUTTERWAVE WEBHOOK
// ======================
app.post("/flutterwave-webhook", async (req, res) => {

  try {

    // Verify secret hash
    const secretHash = process.env.FLW_WEBHOOK_SECRET;

    if (req.headers["verif-hash"] !== secretHash) {
      return res.sendStatus(401);
    }

    const payload = req.body;

    console.log("WEBHOOK RECEIVED");
    console.log(payload);

    // Only process successful transactions
    if (
      payload.event === "charge.completed" &&
      payload.data.status === "successful"
    ) {

      const transactionId = String(payload.data.id);
      const email = payload.data.customer.email;
      const amount = Number(payload.data.amount);

      const user = await User.findOne({ email });

      if (!user) {
        return res.sendStatus(200);
      }

      // Prevent duplicate credit
      if (user.processedTxIds.includes(transactionId)) {
        console.log("Transaction already processed");
        return res.sendStatus(200);
      }

      user.balance += amount;
      user.processedTxIds.push(transactionId);

      await user.save();

      const payment = new Payment({
        customer: email,
        amount,
        transactionId,
        reference: payload.data.tx_ref,
        method: "Flutterwave",
        status: "Successful"
      });

      await payment.save();

      console.log("Wallet credited:", email);

    }

    return res.sendStatus(200);

  } catch (err) {

    console.log(err);

    return res.sendStatus(500);

  }

});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src/index.html"));
});

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});