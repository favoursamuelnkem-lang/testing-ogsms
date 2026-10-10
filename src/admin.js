if (localStorage.getItem("adminLoggedIn") !== "true") {

    window.location.href = "admin-login.html";

}
const API_URL = window.OGSMS_API_URL || "https://testing-ogsms.onrender.com";

async function loadDashboard() {

    try {

        const response = await fetch(`${API_URL}/admin/dashboard`);

        const data = await response.json();

        console.log(data);

        document.getElementById("totalUsers").textContent = data.totalUsers;
document.getElementById("numbersSold").textContent = data.numbersSold;
document.getElementById("pendingOrders").textContent = data.pendingOrders;
document.getElementById("cancelledOrders").textContent = data.cancelledOrders;
document.getElementById("totalRevenue").textContent =
"₦" + data.totalRevenue.toLocaleString();

document.getElementById("walletBalance").textContent =
"₦" + data.totalWallet.toLocaleString();


const purchaseResponse = await fetch(`${API_URL}/admin/recent-purchases`);

const purchaseData = await purchaseResponse.json();

const table = document.getElementById("purchaseTable");

table.innerHTML = "";

purchaseData.purchases.forEach((purchase) => {

    table.innerHTML += `
        <tr class="border-t">
            <td class="px-6 py-5">${purchase.userEmail}</td>
            <td class="px-6 py-5">${purchase.number}</td>
            <td class="px-6 py-5">${purchase.service}</td>
            <td class="px-6 py-5">₦${purchase.price}</td>
            <td class="px-6 py-5">${purchase.status}</td>
            <td class="px-6 py-5">${new Date(purchase.createdAt).toLocaleDateString()}</td>
        </tr>
    `;

});


const cards = document.getElementById("purchaseCards");

cards.innerHTML = "";

purchaseData.purchases.forEach((purchase) => {

    cards.innerHTML += `
        <div class="border rounded-2xl p-5 shadow-sm">

            <div class="flex justify-between items-center">

                <h3 class="font-semibold text-sm break-all text-[#0B4F63]">
                    ${purchase.userEmail}
                </h3>

               <span class="
    text-[10px]
    px-2
    py-1
    rounded-full
    ${
        purchase.status === "successful"
            ? "bg-green-100 text-green-700"
            : purchase.status === "cancelled"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
    }
">
    ${purchase.status}
</span>

            </div>

           <div class="mt-2">
    <p class="text-gray-500 text-xs">Number</p>
    <p class="text-sm break-all">${purchase.number}</p>
</div>

<div class="mt-2">
    <p class="text-gray-500 text-xs">Service</p>
    <p class="text-sm">${purchase.service}</p>
</div>

<div class="mt-2">
    <p class="text-gray-500 text-xs">Price</p>
    <p class="text-sm">₦${purchase.price}</p>
</div>

<div class="mt-2">
    <p class="text-gray-500 text-xs">Date</p>
    <p class="text-sm">${new Date(purchase.createdAt).toLocaleDateString()}</p>
</div>

            </div>

        </div>
    `;

});

const usersResponse = await fetch(`${API_URL}/admin/users`);

const usersData = await usersResponse.json();

const usersTable = document.getElementById("recentUsersTable");

usersTable.innerHTML = "";

usersData.users.slice(0, 5).forEach((user) => {

    usersTable.innerHTML += `
        <tr class="border-t">
            <td class="px-6 py-5">${user.fullName}</td>
            <td class="px-6 py-5">${user.email}</td>
            <td class="px-6 py-5">₦${user.balance.toLocaleString()}</td>
            <td class="px-6 py-5">${new Date(user.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-5">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Active
                </span>
            </td>
        </tr>
    `;

});

const userCards = document.getElementById("userCards");

userCards.innerHTML = "";

usersData.users.slice(0, 5).forEach((user) => {

    userCards.innerHTML += `
        <div class="border rounded-2xl p-5 shadow-sm">

            <div class="flex justify-between items-center">

                <h3 class="font-bold text-[#0B4F63]">
                    ${user.fullName}
                </h3>

                <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                    Active
                </span>

            </div>

            <div class="mt-4 space-y-3 text-sm">

                <div class="flex justify-between">
                    <span class="text-gray-500">Email</span>
                    <span class="break-all">${user.email}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Wallet</span>
                    <span>₦${user.balance.toLocaleString()}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Joined</span>
                    <span>${new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

            </div>

        </div>
    `;

});



    } catch (error) {

        console.log(error);

    }

}

loadDashboard();

function adminLogout() {

    localStorage.removeItem("adminLoggedIn");

    window.location.href = "admin-login.html";

}