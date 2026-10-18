if (localStorage.getItem("adminLoggedIn") !== "true") {

    window.location.href = "admin-login.html";

}
const API_URL = window.OGSMS_API_URL || "https://testing-ogsms.onrender.com";

async function loadPayments() {

    try {

        const response = await fetch(`${API_URL}/admin/payments`);

        const data = await response.json();

        const table = document.getElementById("paymentTransactionTable");

        table.innerHTML = "";

        const mobile = document.getElementById("mobilePayments");
mobile.innerHTML = "";

        document.getElementById("totalTransactions").textContent = data.payments.length;

        document.getElementById("successfulTransactions").textContent =
            data.payments.filter(p => p.status === "Successful").length;

        document.getElementById("pendingTransactions").textContent =
            data.payments.filter(p => p.status === "Pending").length;

        document.getElementById("failedTransactions").textContent =
            data.payments.filter(p => p.status === "Failed").length;

        data.payments.forEach((payment) => {

            table.innerHTML += `
                <tr class="border-t">
                    <td class="px-6 py-5">${payment.customer}</td>
                    <td class="px-6 py-5">₦${payment.amount.toLocaleString()}</td>
                    <td class="px-6 py-5">${payment.transactionId}</td>
                    <td class="px-6 py-5">${payment.method}</td>
                    <td class="px-6 py-5">
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            ${payment.status}
                        </span>
                    </td>
                    <td class="px-6 py-5">${new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
            `;


            mobile.innerHTML += `
<div class="border rounded-2xl p-5 shadow-sm">

    <div class="flex flex-col gap-3">

        <h2 class="font-bold text-[#0B4F63] break-all">
            ${payment.customer}
        </h2>

        <span class="w-fit bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
            ${payment.status}
        </span>

    </div>

    <p class="mt-3">
        <strong>Amount:</strong> ₦${payment.amount.toLocaleString()}
    </p>

    <p class="mt-2">
        <strong>Transaction:</strong> ${payment.transactionId}
    </p>

    <p class="mt-2">
        <strong>Reference:</strong> ${payment.reference}
    </p>

    <p class="mt-2">
        <strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}
    </p>

</div>
`;

        });

    } catch (err) {

        console.log(err);

    }

}

loadPayments();