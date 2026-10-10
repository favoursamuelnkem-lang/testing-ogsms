if (localStorage.getItem("adminLoggedIn") !== "true") {

    window.location.href = "admin-login.html";

}
const API_URL = window.OGSMS_API_URL || "https://testing-ogsms.onrender.com";

async function loadPrices() {

    try {

        const response = await fetch(`${API_URL}/admin/prices`);

        const data = await response.json();

        const table = document.getElementById("priceTable");
        table.innerHTML = "";

        const mobile = document.getElementById("mobilePrices");
        mobile.innerHTML = "";

        if (data.prices.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8">
                        No Prices
                    </td>
                </tr>
            `;

            mobile.innerHTML = `
                <div class="border rounded-2xl p-5 shadow-sm text-center">
                    No Prices
                </div>
            `;

            return;

        }

        data.prices.forEach((price) => {

            table.innerHTML += `
                <tr class="border-t">

                    <td class="px-6 py-5">
                        ${price.country}
                    </td>

                    <td class="px-6 py-5">
                        ${price.service}
                    </td>

                    <td class="px-6 py-5">
                        ₦${price.price.toLocaleString()}
                    </td>

                    <td class="px-6 py-5">

                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                            Active

                        </span>

                    </td>

                   <td class="px-6 py-5 flex gap-2">

    <button
    onclick="editPrice('${price.country}','${price.service}',${price.price})"
    class="bg-[#0B4F63] text-white px-4 py-2 rounded-lg">

        Edit

    </button>

    <button
    onclick="deletePrice('${price._id}')"
    class="bg-red-500 text-white px-4 py-2 rounded-lg">

        Delete

    </button>

</td>

                </tr>
            `;

            mobile.innerHTML += `

                <div class="border rounded-2xl p-5 shadow-sm">

                    <div class="flex justify-between">

                        <h2 class="font-bold text-[#0B4F63]">

                            ${price.country}

                        </h2>

                        <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">

                            Active

                        </span>

                    </div>

                    <p class="mt-3">

                        <strong>Service:</strong>

                        ${price.service}

                    </p>

                    <p class="mt-2">

                        <strong>Price:</strong>

                        ₦${price.price.toLocaleString()}

                    </p>

                   <div class="grid grid-cols-2 gap-3 mt-5">

    <button
    onclick="editPrice('${price.country}','${price.service}',${price.price})"
    class="bg-[#0B4F63] text-white py-3 rounded-xl">

        Edit

    </button>

    <button
    onclick="deletePrice('${price._id}')"
    class="bg-red-500 text-white py-3 rounded-xl">

        Delete

    </button>

</div>

                </div>

            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

async function savePrice(){

    const country=document.getElementById("country").value.trim().toLowerCase();

    const service=document.getElementById("service").value.trim().toLowerCase();

    const price=document.getElementById("price").value;

    if(!country||!service||!price){

        alert("Fill all fields");

        return;

    }

    const response=await fetch(`${API_URL}/admin/save-price`,{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            country,

            service,

            price

        })

    });

    const data=await response.json();

    if(data.success){

        alert("Price Saved Successfully");

        document.getElementById("country").value="";

        document.getElementById("service").value="";

        document.getElementById("price").value="";

        loadPrices();

    }

}

function editPrice(country,service,price){

    document.getElementById("country").value=country;

    document.getElementById("service").value=service;

    document.getElementById("price").value=price;

}

loadPrices();

async function deletePrice(id) {

    const confirmDelete = confirm("Delete this price?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `${API_URL}/admin/delete-price/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (data.success) {

            alert("Price Deleted Successfully");

            loadPrices();

        } else {

            alert("Failed to delete");

        }

    } catch (err) {

        console.log(err);

        alert("Server Error");

    }

}