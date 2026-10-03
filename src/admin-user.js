if (localStorage.getItem("adminLoggedIn") !== "true") {

    window.location.href = "admin-login.html";

}
const API_URL = window.OGSMS_API_URL || "";

async function loadUsers() {

    try {

        const response = await fetch(`${API_URL}/admin/users`);

        const data = await response.json();

        // Desktop
        const table = document.getElementById("usersTable");
        table.innerHTML = "";

        // Mobile
        const mobile = document.getElementById("mobileUsers");
        mobile.innerHTML = "";

        data.users.forEach((user) => {

            // Desktop Table
            table.innerHTML += `
                <tr class="border-t">
                    <td class="px-6 py-5">${user.fullName}</td>
                    <td class="px-6 py-5">${user.email}</td>
                    <td class="px-6 py-5">₦${user.balance.toLocaleString()}</td>
                    <td class="px-6 py-5">
                        ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td class="px-6 py-5">
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            Active
                        </span>
                    </td>
                </tr>
            `;

            // Mobile Cards
            mobile.innerHTML += `
                <div class="border rounded-2xl p-5 shadow-sm">

                    <h2 class="font-bold text-[#0B4F63]">
                        ${user.fullName}
                    </h2>

                    <p class="text-gray-500 mt-2 break-all">
                        ${user.email}
                    </p>

                    <p class="mt-2">
                        Wallet: ₦${user.balance.toLocaleString()}
                    </p>

                    <p class="mt-2">
                        Joined: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>

                    <div class="mt-4">
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            Active
                        </span>
                    </div>

                </div>
            `;

        });

        

    } catch (err) {

        console.log(err);

    }

}

loadUsers();