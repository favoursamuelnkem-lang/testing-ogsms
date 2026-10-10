if (localStorage.getItem("adminLoggedIn") !== "true") {

    window.location.href = "admin-login.html";

}
const API_URL = window.OGSMS_API_URL || "";

async function loadPurchases() {

    try {

        const response = await fetch(`${API_URL}/admin/recent-purchases`);

        const data = await response.json();

        const table = document.getElementById("purchaseTable");

        table.innerHTML = "";

        const mobile = document.getElementById("mobilePurchases");
mobile.innerHTML = "";

        data.purchases.forEach((purchase) => {

            table.innerHTML += `
                <tr class="border-t">
                    <td class="px-6 py-5">${purchase.userEmail}</td>
                    <td class="px-6 py-5">${purchase.number}</td>
                    <td class="px-6 py-5">${purchase.service}</td>
                    <td class="px-6 py-5">₦${purchase.price}</td>
                    <td class="px-6 py-5">${purchase.status}</td>
                    <td class="px-6 py-5">
                        <button class="bg-[#0B4F63] text-white px-4 py-2 rounded-lg">
                            View
                        </button>
                    </td>
                </tr>

                
            `;

            mobile.innerHTML += `
    <div class="border rounded-2xl p-5 shadow-sm">

        <div class="flex flex-col gap-3">

    <h2 class="font-bold text-[#0B4F63] break-all">
        ${purchase.userEmail}
    </h2>

    <span class="
        w-fit
        text-xs
        px-3
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
        <p class="mt-3 text-gray-500">
            <strong>Number:</strong> ${purchase.number}
        </p>

        <p class="mt-2">
            <strong>Service:</strong> ${purchase.service}
        </p>

        <p class="mt-2">
            <strong>Price:</strong> ₦${purchase.price}
        </p>

        <div class="grid grid-cols-2 gap-3 mt-5">

            <button class="bg-[#0B4F63] text-white py-3 rounded-xl">
                View
            </button>

            <button class="bg-red-500 text-white py-3 rounded-xl">
                Cancel
            </button>

        </div>

    </div>
`;

        });

    } catch (err) {

        console.log(err);

    }

}

loadPurchases();