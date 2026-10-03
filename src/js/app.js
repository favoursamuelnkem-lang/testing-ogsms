

const API_URL = window.OGSMS_API_URL || "";



// ======================
// CURRENT USER
// ======================

const currentUser =
JSON.parse(
  localStorage.getItem(
    "currentUser"
  )
);

function ensureToast() {
  let toast = document.getElementById("toast");
  if (toast) return toast;

  toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "fixed top-5 right-5 translate-x-[120%] bg-[#0B4F63] text-white px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300 z-[9999] max-w-sm";
  toast.innerHTML = '<div><span id="toastMessage"></span></div>';
  document.body.appendChild(toast);
  return toast;
}

function showToast(message, type = "success") {
  const toast = ensureToast();
  const text = document.getElementById("toastMessage");
  
  if (!text) return;

  text.innerText = message;
  toast.classList.remove("bg-[#0B4F63]", "bg-orange-500", "bg-red-500");

  if (type === "error") {
    toast.classList.add("bg-red-500");
  } else if (type === "warning") {
    toast.classList.add("bg-orange-500");
  } else {
    toast.classList.add("bg-[#0B4F63]");
  }

  toast.classList.remove("translate-x-[120%]");
  toast.classList.add("translate-x-0");

  clearTimeout(window.__ogsmsToastTimer);
  window.__ogsmsToastTimer = setTimeout(() => {
    toast.classList.remove("translate-x-0");
    toast.classList.add("translate-x-[120%]");
  }, 3500);
}

// ======================
// REGISTER SYSTEM
// ======================
// ======================
// REGISTER SYSTEM
// ======================

const registerForm =
document.getElementById(
  "registerForm"
);

if(registerForm){

  registerForm.addEventListener(
    "submit",
    async function(e){

      e.preventDefault();

      const fullName =
      document.getElementById(
        "fullName"
      ).value;

      const email =
      document.getElementById(
        "email"
      ).value;

      const phoneNumber =
      document.getElementById(
        "phoneNumber"
      ).value.trim();

      const password =
      document.getElementById(
        "password"
      ).value;

      const registerBtn =
      document.getElementById(
        "registerBtn"
      );

      // SHOW LOADING
      registerBtn.disabled = true;

      registerBtn.innerHTML = `
        <span class="inline-flex items-center justify-center gap-2"> Creating account...

        </span>
      `;

      try{

        const response =
        await fetch(

          `${API_URL}/register`,

          {

            method: "POST",

            headers: {

              "Content-Type":
              "application/json"

            },

            body: JSON.stringify({

              fullName,
              email,
              phoneNumber,
              password

            })

          }

        );

        const data =
        await response.json();

        if(data.success){

          showToast(
            "Registration Successful",
            "success"
          );

          setTimeout(() => {

            window.location.href =
            "login.html";

          }, 1500);

        }

        else{

          // STOP LOADING
          registerBtn.disabled = false;

          registerBtn.innerHTML =
          "Register";

          showToast(
            data.message,
            "error"
          );

        }

      }

      catch(error){

        console.log(error);

        // STOP LOADING
        registerBtn.disabled = false;

        registerBtn.innerHTML =
        "Register";

        showToast(
          "Server Error",
          "error"
        );

      }

    }

  );

}

// ======================
// LOGIN SYSTEM
// ======================

const loginForm =
document.getElementById(
  "loginForm"
);

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async function(e){

      e.preventDefault();

      const email =
      document.getElementById(
        "email"
      ).value;

      const password =
      document.getElementById(
        "password"
      ).value;

      const loginBtn =
      document.getElementById(
        "loginBtn"
      );

      // SHOW LOADING
      loginBtn.disabled = true;

      loginBtn.innerHTML = `
        <span class="inline-flex items-center justify-center gap-2"> Logging in...

        </span>
      `;

      try{

        const response =
        await fetch(

          `${API_URL}/login`,

          {

            method: "POST",

            headers: {

              "Content-Type":
              "application/json"

            },

            body: JSON.stringify({

              email,
              password

            })

          }

        );

        const data =
        await response.json();

        if(data.success){

          localStorage.setItem(

            "currentUser",

            JSON.stringify(
              data.user
            )

          );

          showToast(
            "Login Successful"
          );

          window.location.href =
          "dashboard.html";

        }

        else{

          // STOP LOADING
          loginBtn.disabled = false;

          loginBtn.innerHTML = "Login";

          showToast(
            data.message,
            "error"
          );

        }

      }

      catch(error){

        console.log(error);

        // STOP LOADING
        loginBtn.disabled = false;

        loginBtn.innerHTML = "Login";

        showToast(
          "Server Error",
          "error"
        );

      }

    }

  );

}

// ======================
// LOAD USER DATA
// ======================

async function loadUserData(){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  if(!currentUser){

    return;

  }

  try{

    const response =
    await fetch(

      `${API_URL}/get-user`,

      {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json"

        },

        body: JSON.stringify({

          email:
          currentUser.email

        })

      }

    );

    const data =
    await response.json();

    if(data.success){

      localStorage.setItem(

        "currentUser",

        JSON.stringify(
          data.user
        )

      );

      // USER NAME

      const userName =
      document.getElementById(
        "userName"
      );

      if(userName){

        userName.innerText =

        data.user.fullName ||

        "OGSMS User";

      }

      // USER EMAIL

      const userEmail =
      document.getElementById(
        "userEmail"
      );

      if(userEmail){

        userEmail.innerText =
        data.user.email;

      }

      // WALLET BALANCE

      const walletBalance =
      document.getElementById(
        "walletBalance"
      );

      if(walletBalance){

        walletBalance.innerText =

        "₦" +

        Number(
          data.user.balance || 0
        ).toLocaleString();

      }

    }

  }

  catch(error){

    console.log(error);

  }

}


// ======================
// SET QUICK AMOUNT
// ======================

function setAmount(amount){

  document.getElementById(
    "amount"
  ).value = amount;

}


// ======================
// FUND WALLET
// ======================

async function verifyPayment(tx_id, amount) {

  console.log("SMS VERIFY PAYMENT CALLED");
  console.log("TX_ID:", tx_id);
  console.log("AMOUNT:", amount);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  console.log("Account CURRENT USER:", currentUser);

  if (!currentUser) {
    console.log("❌ No user found");
    return;
  }

  const payload = {
    email: currentUser.email,
    amount,
    transaction_id: tx_id
  };

  console.log("Sent SENDING TO BACKEND:", payload);

  const res = await fetch(`${API_URL}/update-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  console.log("Received BACKEND RESPONSE:", data);

  if (data.success) {
    console.log("✅ WALLET UPDATED SUCCESSFULLY");

    currentUser.balance = data.balance;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

  } else {
    console.log("❌ WALLET UPDATE FAILED:", data.message);
  }
}
// ======================
// FLUTTERWAVE PAYMENT
// ======================

function makePayment(){

  const amount =
  document.getElementById(
    "amount"
  ).value;

  const fundWalletBtn =
  document.getElementById(
    "fundWalletBtn"
  );

  if (amount === "") {

    showToast(
      "Enter amount",
      "error"
    );

    return;

  }

  if (!currentUser) {

    showToast(
      "Login Required",
      "error"
    );

    return;

  }

  // SHOW LOADING
  fundWalletBtn.disabled = true;

  fundWalletBtn.innerHTML = `
    <span class="inline-flex items-center justify-center gap-2"> Opening Payment...

    </span>
  `;

  try {

    FlutterwaveCheckout({

      public_key:
      "FLWPUBK-ab46a67dfb1a6016ae7159462676aee7-X",

      tx_ref:
      "OGSMS-" + Date.now(),

      amount:
      amount,

      currency:
      "NGN",

      payment_options:
      "card,banktransfer,ussd",

      customer: {

        email:
        currentUser.email,

        name:
        currentUser.fullName ||
        "OGSMS User"

      },

      customizations: {

        title:
        "OGSMS Wallet Funding",

        description:
        "Wallet Deposit",

        logo:
        "https://flutterwave.com/images/logo-colored.svg"

      },

      callback: function(response) {

        console.log(
          "FLUTTERWAVE RESPONSE:",
          response
        );

        if (!response.transaction_id) {

          fundWalletBtn.disabled = false;

          fundWalletBtn.innerHTML =
          "Fund Wallet";

          showToast(
            "Payment Failed",
            "error"
          );

          return;

        }

        // PAYMENT RECEIVED
        fundWalletBtn.innerHTML = `
          <span class="inline-flex items-center justify-center gap-2"> Processing Payment...

          </span>
        `;

        localStorage.setItem(
          "pendingTxId",
          response.transaction_id
        );

        localStorage.setItem(
          "pendingTxRef",
          response.tx_ref
        );

        localStorage.setItem(
          "pendingAmount",
          amount
        );

        setTimeout(() => {

          window.location.href =
          "dashboard.html";

        }, 800);

      },

      onclose: function(){

        console.log(
          "Payment Closed"
        );

        // PAYMENT WINDOW CLOSED
        fundWalletBtn.disabled = false;

        fundWalletBtn.innerHTML =
        "Fund Wallet";

      }

    });

  }

  catch(error){

    console.log(error);

    fundWalletBtn.disabled = false;

    fundWalletBtn.innerHTML =
    "Fund Wallet";

    showToast(
      "Unable to open payment. Please try again.",
      "error"
    );

  }

}

// ======================
// BUY NUMBER
// ======================

const buyButtons =
document.querySelectorAll(
  "#buyBtn"
);

buyButtons.forEach((button) => {

  button.addEventListener(
    "click",
    async function(){

      const currentUser =
      JSON.parse(
        localStorage.getItem(
          "currentUser"
        )
      );

      if(!currentUser){

    showToast("Login Required", "error");

    return;

}

      try{

        const response =
        await fetch(

          `${API_URL}/buy-number`,

          {

            method: "POST",

            headers: {

              "Content-Type":
              "application/json"

            },

           body: JSON.stringify({

  email:
  currentUser.email,

  country:
  document.getElementById(
    "country"
  ).value,

  service:
  document.getElementById(
    "service"
  ).value

})
          }

        );

        const data =
        await response.json();

   if (data.success) {

    currentUser.balance = data.balance;

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    loadUserData();

    showToast(
    `✅ Number Purchased: ${data.number}`,
    "success"
);

}

else {

    showToast(data.message, "error");

}

      }

     catch(error){

    console.log(error);

    showToast("Server Error", "error");

}

    }
  );

});


// ======================
// LOGOUT
// ======================

function logout(){

  localStorage.removeItem(
    "currentUser"
  );

  window.location.href =
  "login.html";

}


// ======================
// LOAD DATA
// ======================

loadUserData();



// ======================
// LIVE 5SIM PRICE
// ======================

const countrySelect =
document.getElementById(
  "country"
);

const serviceSelect =
document.getElementById(
  "service"
);

const priceInput =
document.getElementById(
  "price"
);

async function loadCountries() {

    const countrySelect = document.getElementById("country");

    if (!countrySelect) return;

    try {

        const response = await fetch(`${API_URL}/countries`);
        const data = await response.json();

        countrySelect.innerHTML = "";

        data.countries.forEach(country => {

            countrySelect.innerHTML += `
                <option value="${country}">
                    ${country}
                </option>
            `;

        });

        loadPrice();

    } catch (err) {

        console.log(err);

    }

}

async function loadPrice(){

  if(
    !countrySelect ||
    !serviceSelect ||
    !priceInput
  ){

    return;

  }

  try{

    priceInput.value =
    "Loading...";

   const response =
await fetch(
  `${API_URL}/get-price`,
      {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json"

        },

        body: JSON.stringify({

         country:
countrySelect.value,

service:
serviceSelect.value

        })

      }

    );

    const data =
    await response.json();

    console.log(data);

   
if (data.success) {

    priceInput.value = "₦" + Number(data.price).toLocaleString();

} else {

    priceInput.value = "Not Available";

}

}


  

  catch(error){

    console.log(error);

    priceInput.value =
    "Error";

  }

}

if(countrySelect){

  countrySelect.addEventListener(
    "change",
    loadPrice
  );

}

if(serviceSelect){

  serviceSelect.addEventListener(
    "change",
    loadPrice
  );

}

loadCountries();

async function cancelNumber(orderId, price){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  try{

    const response =
await fetch(
  `${API_URL}/cancel-number`,
      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          email:
          currentUser.email,

          orderId:
          orderId,

          price:
          price

        })

      }

    );

    const data =
    await response.json();

  if (data.success) {

    showToast(
        `✅ Number Cancelled • Refund ₦${price}`,
        "success"
    );

    setTimeout(() => {
        location.reload();
    }, 1800);

}

else {

    showToast(data.message, "error");

}

  }

 catch(error){

    console.log(error);

    showToast("Server Error", "error");

}

}


// ======================
// RECENT ORDERS
// ======================

async function loadRecentOrders(){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  if(!currentUser){
    return;
  }

  const table =
  document.getElementById(
    "recentOrders"
  );

  if(!table){
    return;
  }

  try{

    const response =
await fetch(
  `${API_URL}/purchase-history`,

      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          email:
          currentUser.email

        })

      }

    );

   const data = await response.json();

console.log("API RESPONSE:", data);

table.innerHTML = "";

// mobile reset
const mobileOrders = document.getElementById("mobileOrders");
if (mobileOrders) {
  mobileOrders.innerHTML = "";
}

// SAFE FIX
const purchases = data.purchases || data.data || data.orders || [];

if (!Array.isArray(purchases) || purchases.length === 0) {
  table.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-6 text-gray-400">
        No orders yet
      </td>
    </tr>
  `;
  return;
}

purchases.slice(0, 5).forEach((item) => {   
    

if(mobileOrders){

  mobileOrders.innerHTML += `
    <div class="bg-gray-50 p-4 rounded-xl border">

      <p class="font-semibold text-gray-800">
        ${item.country || "Global"} • ${item.service}
      </p>

      <p class="text-gray-600 mt-1">
        ${item.number}
      </p>

      <p class="text-sm mt-2 ${
        item.status === "successful"
          ? "text-green-500"
          : item.status === "cancelled"
          ? "text-red-500"
          : "text-orange-500"
      }">
        ${item.status}
      </p>

    </div>
  `;

}
      table.innerHTML += `

      <tr class="border-b">

        <td class="py-6">
          Global
        </td>

        <td>
          ${item.number}
        </td>

        <td>
          ${item.service}
        </td>

        <td>
          ${item.status}
        </td>

        <td>
          ${new Date(
            item.createdAt
          ).toLocaleDateString()}
        </td>

      </tr>

      `;

    });

  }

  catch(error){

    console.log(error);

  }

}

loadRecentOrders();
loadTransactionHistory();


// ======================
// USER TRANSACTION HISTORY
// ======================

async function loadTransactionHistory() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const container = document.getElementById("transactionHistory");

  if (!container || !currentUser) return;

  try {
    const response = await fetch(`${API_URL}/payment-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: currentUser.email
      })
    });

    const data = await response.json();

    console.log("USER TRANSACTIONS:", data);

    if (
      !data.success ||
      !Array.isArray(data.payments) ||
      data.payments.length === 0
    ) {
      container.innerHTML = `
        <div class="p-8 text-center text-gray-400">
          No transactions yet.
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    data.payments.slice(0, 5).forEach(payment => {

      const amount = Number(payment.amount || 0).toLocaleString();

      const date = new Date(payment.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );

      container.innerHTML += `
        <div class="flex items-center justify-between gap-4 p-5 md:p-6 border-b last:border-b-0 hover:bg-gray-50 transition">

          <div class="flex items-center gap-4">

            <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
              Wallet
            </div>

            <div>
              <p class="font-bold text-gray-800">
                Wallet Deposit
              </p>

              <p class="text-sm text-gray-400 mt-1">
                Flutterwave • ${date}
              </p>
            </div>

          </div>

          <div class="text-right">

            <p class="font-bold text-green-600">
              +₦${amount}
            </p>

            <span class="inline-block mt-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
              ${payment.status}
            </span>

          </div>

        </div>
      `;
    });

  } catch (error) {

    console.log("TRANSACTION HISTORY ERROR:", error);

    container.innerHTML = `
      <div class="p-8 text-center text-red-400">
        Unable to load transactions.
      </div>
    `;
  }
}

loadTransactionHistory();

const walletSuccess = localStorage.getItem("walletSuccess");

if (walletSuccess) {
    showToast(walletSuccess, "success");
    localStorage.removeItem("walletSuccess");
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";

  });

}




// ======================
// FORGOT PASSWORD
// ======================

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();
    const btn = document.getElementById("forgotBtn");

    btn.disabled = true;
    btn.innerText = "Sending...";

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, "success");
        forgotPasswordForm.reset();
      } else {
        showToast(data.message || "Unable to send reset link", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Server Error. Please try again.", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Send Reset Link";
    }
  });
}

// ======================
// RESET PASSWORD
// ======================

const resetPasswordForm = document.getElementById("resetPasswordForm");

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const btn = document.getElementById("resetBtn");
    const result = document.getElementById("resetResult");

    if (!token) {
      showToast("This reset link is missing or invalid.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Resetting...";

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, "success");
        result.className = "mt-5 p-4 rounded-xl text-sm bg-green-50 text-green-700";
        result.innerText = data.message + " Redirecting to login...";
        result.classList.remove("hidden");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1800);
      } else {
        showToast(data.message || "Unable to reset password", "error");
        result.className = "mt-5 p-4 rounded-xl text-sm bg-red-50 text-red-700";
        result.innerText = data.message || "Unable to reset password";
        result.classList.remove("hidden");
      }
    } catch (error) {
      console.error(error);
      showToast("Server Error. Please try again.", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Reset Password";
    }
  });
}
