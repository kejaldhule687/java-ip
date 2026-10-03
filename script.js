/* ==========================================
   HOTEL MANAGEMENT SYSTEM
   GRANDSTAY VERSION 2.0
   ========================================== */


/* ==============================
   DATA
   ============================== */

let guests =
    JSON.parse(
        localStorage.getItem("hotelGuests")
    ) || [];


const prices = {

    Single: 1500,

    Double: 2500,

    Deluxe: 3500

};


const TOTAL_ROOMS = 20;


/* ==============================
   GET NUMBER OF DAYS
   ============================== */

function getDays(checkin, checkout) {

    const start =
        new Date(checkin);

    const end =
        new Date(checkout);

    const difference =
        end - start;

    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    return days > 0 ? days : 1;
}


/* ==============================
   GET BILL AMOUNT
   ============================== */

function getAmount(guest) {

    const rate =
        prices[guest.type] || 0;

    const days =
        getDays(
            guest.checkin,
            guest.checkout
        );

    return rate * days;
}


/* ==============================
   SAVE DATA
   ============================== */

function saveGuests() {

    localStorage.setItem(
        "hotelGuests",
        JSON.stringify(guests)
    );
}


/* ==============================
   FORM SUBMIT
   ============================== */

document
    .getElementById("guestForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const room =
                document
                    .getElementById("room")
                    .value;

            const type =
                document
                    .getElementById("type")
                    .value;

            const checkin =
                document
                    .getElementById("checkin")
                    .value;

            const checkout =
                document
                    .getElementById("checkout")
                    .value;

            const payment =
                document
                    .getElementById("payment")
                    .value;

            const editIndex =
                Number(
                    document
                        .getElementById("editIndex")
                        .value
                );


            /* VALIDATION */

            if (
                !name ||
                !phone ||
                !room ||
                !type ||
                !checkin ||
                !checkout ||
                !payment
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }


            if (!/^\d{7,15}$/.test(phone)) {

                alert(
                    "Please enter a valid phone number."
                );

                return;
            }


            if (
                new Date(checkout)
                <=
                new Date(checkin)
            ) {

                alert(
                    "Check-out date must be after check-in date."
                );

                return;
            }


            /* ROOM CONFLICT */

            const roomExists =
                guests.some(
                    (guest, index) => {

                        return (
                            index !== editIndex &&
                            String(guest.room)
                            === String(room)
                        );

                    }
                );


            if (roomExists) {

                alert(
                    "This room is already assigned."
                );

                return;
            }


            const guest = {

                name: name,

                phone: phone,

                room: room,

                type: type,

                checkin: checkin,

                checkout: checkout,

                payment: payment

            };


            /* INSERT */

            if (editIndex === -1) {

                guests.push(guest);

                alert(
                    "Guest added successfully!"
                );

            }


            /* UPDATE */

            else {

                guests[editIndex] = guest;

                alert(
                    "Guest updated successfully!"
                );

            }


            saveGuests();

            clearForm();

            displayGuests();

        }
    );


/* ==============================
   DISPLAY GUESTS
   ============================== */

function displayGuests(
    searchText = ""
) {

    const table =
        document.getElementById(
            "guestTable"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    table.innerHTML = "";


    const filteredGuests =
        guests.filter(
            guest => {

                const text =
                    searchText
                        .toLowerCase();

                return (
                    guest.name
                        .toLowerCase()
                        .includes(text)

                    ||

                    guest.phone
                        .includes(text)

                    ||

                    String(guest.room)
                        .includes(text)

                    ||

                    guest.type
                        .toLowerCase()
                        .includes(text)
                );

            }
        );


    if (filteredGuests.length === 0) {

        emptyMessage.style.display =
            "block";

    }

    else {

        emptyMessage.style.display =
            "none";

    }


    filteredGuests.forEach(
        (guest) => {

            const realIndex =
                guests.indexOf(guest);

            const row =
                document.createElement("tr");


            const amount =
                getAmount(guest);


            row.innerHTML = `

                <td>
                    <strong>
                        ${guest.name}
                    </strong>
                </td>

                <td>
                    ${guest.phone}
                </td>

                <td>
                    Room ${guest.room}
                </td>

                <td>
                    ${guest.type}
                </td>

                <td>
                    ${formatDate(guest.checkin)}
                </td>

                <td>
                    ${formatDate(guest.checkout)}
                </td>

                <td>

                    <span
                        style="
                            padding:5px 9px;
                            border-radius:20px;
                            background:
                            ${
                                guest.payment === "Paid"
                                ? "#ecfdf5"
                                : "#fff7ed"
                            };
                            color:
                            ${
                                guest.payment === "Paid"
                                ? "#16a34a"
                                : "#ea580c"
                            };
                            font-weight:600;
                            font-size:10px;
                        "
                    >
                        ${guest.payment}
                    </span>

                </td>

                <td>
                    <strong>
                        ₹${amount.toLocaleString("en-IN")}
                    </strong>
                </td>

                <td>

                    <button
                        class="edit"
                        onclick="editGuest(${realIndex})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete"
                        onclick="deleteGuest(${realIndex})"
                    >
                        Delete
                    </button>

                    <button
                        class="bill"
                        onclick="generateBill(${realIndex})"
                    >
                        Bill
                    </button>

                </td>
            `;


            table.appendChild(row);

        }
    );


    document
        .getElementById("recordCount")
        .textContent =
        filteredGuests.length;


    updateDashboard();

}


/* ==============================
   FORMAT DATE
   ============================== */

function formatDate(date) {

    const d =
        new Date(date);

    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ==============================
   EDIT GUEST
   ============================== */

function editGuest(index) {

    const guest =
        guests[index];


    document
        .getElementById("editIndex")
        .value = index;


    document
        .getElementById("name")
        .value = guest.name;


    document
        .getElementById("phone")
        .value = guest.phone;


    document
        .getElementById("room")
        .value = guest.room;


    document
        .getElementById("type")
        .value = guest.type;


    document
        .getElementById("checkin")
        .value = guest.checkin;


    document
        .getElementById("checkout")
        .value = guest.checkout;


    document
        .getElementById("payment")
        .value = guest.payment;


    document
        .getElementById("saveBtn")
        .innerHTML =
        "✓ Update Guest";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ==============================
   DELETE GUEST
   ============================== */

function deleteGuest(index) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this guest?"
        );


    if (!confirmDelete) {

        return;

    }


    guests.splice(index, 1);

    saveGuests();

    displayGuests();

}


/* ==============================
   CLEAR FORM
   ============================== */

function clearForm() {

    document
        .getElementById("guestForm")
        .reset();


    document
        .getElementById("editIndex")
        .value = -1;


    document
        .getElementById("saveBtn")
        .innerHTML =
        "<span>＋</span> Add Guest";

}


/* ==============================
   GENERATE BILL
   ============================== */

function generateBill(index) {

    const guest =
        guests[index];


    const days =
        getDays(
            guest.checkin,
            guest.checkout
        );


    const rate =
        prices[guest.type];


    const total =
        rate * days;


    document
        .getElementById("billNumber")
        .textContent =
        "GST-" +
        Date.now()
            .toString()
            .slice(-6);


    document
        .getElementById("billGuest")
        .textContent =
        guest.name;


    document
        .getElementById("billPhone")
        .textContent =
        guest.phone;


    document
        .getElementById("billRoom")
        .textContent =
        guest.room +
        " (" +
        guest.type +
        ")";


    document
        .getElementById("billDates")
        .textContent =
        formatDate(guest.checkin) +
        " - " +
        formatDate(guest.checkout);


    document
        .getElementById("billRate")
        .textContent =
        "₹" +
        rate.toLocaleString("en-IN");


    document
        .getElementById("billDays")
        .textContent =
        days;


    document
        .getElementById("billTotal")
        .textContent =
        "₹" +
        total.toLocaleString("en-IN");


    document
        .getElementById("billPayment")
        .textContent =
        guest.payment;


    document
        .getElementById("billing")
        .style.display =
        "block";


    document
        .getElementById("billing")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ==============================
   PRINT BILL
   ============================== */

function printBill() {

    window.print();

}


/* ==============================
   CLOSE BILL
   ============================== */

function closeBill() {

    document
        .getElementById("billing")
        .style.display =
        "none";

}


/* ==============================
   DASHBOARD
   ============================== */

function updateDashboard() {

    document
        .getElementById("totalGuests")
        .textContent =
        guests.length;


    const occupiedRooms =
        new Set(
            guests.map(
                guest =>
                    guest.room
            )
        ).size;


    document
        .getElementById("occupiedRooms")
        .textContent =
        occupiedRooms;


    document
        .getElementById("availableRooms")
        .textContent =
        Math.max(
            TOTAL_ROOMS -
            occupiedRooms,
            0
        );


    let revenue = 0;


    guests.forEach(
        guest => {

            revenue +=
                getAmount(guest);

        }
    );


    document
        .getElementById("totalRevenue")
        .textContent =
        "₹" +
        revenue.toLocaleString(
            "en-IN"
        );

}


/* ==============================
   SEARCH
   ============================== */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function() {

            displayGuests(
                this.value
            );

        }
    );


/* ==============================
   NAVIGATION
   ============================== */

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            function() {

                navLinks.forEach(
                    item =>
                        item.classList
                            .remove("active")
                );


                this.classList.add(
                    "active"
                );

            }
        );

    }
);


/* ==============================
   INITIAL LOAD
   ============================== */

displayGuests();
updateDashboard();