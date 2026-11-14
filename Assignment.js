
// Load assignments from localStorage
let assignments = JSON.parse(
    localStorage.getItem("assignments") || "[]"
);

// Save assignments
function saveAssignments() {
    localStorage.setItem(
        "assignments",
        JSON.stringify(assignments)
    );
}

/* DISPLAY ASSIGNMENTS */

function displayAssignments() {

    const list = document.getElementById("assignmentList");

    const search = document.getElementById("search")
        .value.toLowerCase();

    const filter = document.getElementById("filter").value;
    const sort = document.getElementById("sort").value;

    let result = assignments.filter(a =>
        a.name.toLowerCase().includes(search) &&
        (filter === "all" || a.status === filter)
    );

    // Sort assignments
    if (sort === "name") {
        result.sort((a, b) =>
            a.name.localeCompare(b.name));
    } else if (sort === "date") {
        result.sort((a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sort === "progress") {
        result.sort((a, b) =>
            b.progress - a.progress);
    }

    list.innerHTML = "";

    if (result.length === 0) {
        list.textContent = "No assignments found.";
        return;
    }

    result.forEach(a => {

        const card = document.createElement("article");
        card.className = "assignment-card";

        card.innerHTML = `
            <h3>${a.name}</h3>

            <p><b>Due Date:</b> ${a.dueDate}</p>

            <p><b>Progress:</b> ${a.progress}%</p>

            <div class="progress-bar">
                <div class="progress-fill"
                     style="width: ${a.progress}%">
                </div>
            </div>

            <span class="status">${a.status}</span>

            <button class="view-btn">View Details</button>

            <button class="update-btn">Update Progress</button>
        `;

        card.querySelector(".view-btn")
            .addEventListener("click", () =>
                viewDetails(a.id));

        card.querySelector(".update-btn")
            .addEventListener("click", () =>
                updateProgress(a.id));

        list.appendChild(card);
    });
}

/* VIEW ASSIGNMENT DETAILS */

function viewDetails(id) {

    const a = assignments.find(item => item.id === id);

    if (!a) return;

    const details = document.getElementById("details");

    details.innerHTML = "";

    const heading = document.createElement("h2");

    heading.textContent = "Assignment Details";

    const fields = [
        ["Name", a.name],
        ["Description", a.description],
        ["Due Date", a.dueDate],
        ["Progress", a.progress + "%"],
        ["Status", a.status]
    ];

    details.appendChild(heading);

    fields.forEach(([label, value]) => {

        const p = document.createElement("p");

        p.textContent = label + ": " + value;

        details.appendChild(p);
    });
}

/* UPDATE ASSIGNMENT PROGRESS */

function updateProgress(id) {

    const a = assignments.find(item => item.id === id);

    if (!a) return;

    const input = prompt(
        "Enter progress (0-100):",
        a.progress
    );

    if (input === null || input.trim() === "") return;

    const value = Number(input);

    if (!Number.isInteger(value) || value < 0 || value > 100) {

        alert("Enter a valid number between 0 and 100.");

        return;
    }

    a.progress = value;

    if (value === 100) {

        a.status = "Completed";

    } else if (value === 0) {

        a.status = "Not Started";

    } else {

        a.status = "In Progress";
    }

    // Save updated assignment
    saveAssignments();

    displayAssignments();

    viewDetails(id);

    // Update main calendar
    syncMainCalendar();
}


/* ADD NEW ASSIGNMENT */

function addAssignment(name, description, dueDate) {

    const newAssignment = {

        id: Date.now(),

        name: name,

        description: description,

        dueDate: dueDate,

        progress: 0,

        status: "Not Started",

        type: "assignment"
    };

    assignments.push(newAssignment);

    saveAssignments();

    displayAssignments();

    syncMainCalendar();

    alert("Assignment added successfully!");
}


/* DELETE ASSIGNMENT */

function deleteAssignment(id) {

    assignments = assignments.filter(
        a => a.id !== id
    );

    saveAssignments();

    displayAssignments();

    syncMainCalendar();
}


/* MAIN CALENDAR CONNECTION */

function syncMainCalendar() {

    // Get existing calendar events
    let events = JSON.parse(
        localStorage.getItem("calendarEvents") || "[]"
    );

    // Remove old assignment entries
    events = events.filter(
        event => event.type !== "assignment"
    );

    // Convert assignments into calendar events
    const assignmentEvents = assignments.map(a => ({

        id: "assignment-" + a.id,

        title: a.name,

        start: a.dueDate,

        type: "assignment",

        description: a.description,

        status: a.status,

        color: "#3B82F6"

    }));

    // Combine assignments with existing events
    events = [...events, ...assignmentEvents];

    // Save calendar events
    localStorage.setItem(
        "calendarEvents",
        JSON.stringify(events)
    );

    console.log("Main calendar synchronized!");
}

/* SEARCH, FILTER AND SORT */

document.getElementById("search")
    .addEventListener("input", displayAssignments);

document.getElementById("filter")
    .addEventListener("change", displayAssignments);

document.getElementById("sort")
    .addEventListener("change", displayAssignments);


/* INITIALIZE */

// Synchronize saved assignments
syncMainCalendar();

// Display assignments
displayAssignments();
