
const API_URL = window.OGSMS_API_URL || "";

async function adminLogin() {

    const username = document.getElementById("username").value.trim();

    const password = document.getElementById("password").value.trim();

    if (!username || !password) {

        alert("Enter username and password");

        return;

    }

    try {

        const response = await fetch(`${API_URL}/admin/login`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                username,

                password

            })

        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("adminLoggedIn", "true");

            window.location.href = "admin-dashboard.html";

        }

        else {

            alert(data.message);

        }

    }

    catch (err) {

        console.log(err);

        alert("Server Error");

    }

}