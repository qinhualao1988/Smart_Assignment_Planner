
// HTML elements
const eventList = document.getElementById("event-list");
const searchInput = document.getElementById("search-tasks");
const sortInput = document.getElementById("sort-tasks");
const tabs = [...document.querySelectorAll(".tab")];

const detailsModal = document.getElementById("details-modal");
const detailsContent = document.getElementById("details-content");
const closeModalButton = document.getElementById("close-modal");
const modalCloseBottom = document.getElementById("modal-close-bottom");
const backButton = document.getElementById("back-button");

// Share storage with Dashboard
const STORAGE_KEY = "plannerEvents";

// Load events
function loadTasks() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Could not load assignments:", error);
        return [];
    }
}

let events = loadTasks();
let activeFilter = "all";

// Save events
function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );
}

// Format date
function displayDate(dateString) {
    if (!dateString) return "Not specified";

    const date = new Date(`${dateString}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// Create elements
function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

// Format category
function categoryLabel(category) {
    const labels = {
        class: "Class",
        assignment: "Assignment",
        exam: "Exam",
        meeting: "Meeting",
        personal: "Personal"
    };

    return labels[category] || "Assignment";
}

// Filter and sort events
function getVisibleTasks() {
    const search = searchInput.value.trim().toLowerCase();

    let result = events.filter(task => {
        const text = [
            task.title,
            task.category
        ].join(" ").toLowerCase();

        const matchesSearch = text.includes(search);
        const completed = Boolean(task.completed);

        const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "completed" && completed) ||
            (activeFilter === "pending" && !completed);

        return matchesSearch && matchesFilter;
    });

    const sort = sortInput.value;

    result.sort((a, b) => {
        if (sort === "title") {
            return (a.title || "").localeCompare(b.title || "");
        }

        return (a.date || "").localeCompare(b.date || "") ||
            (a.time || "").localeCompare(b.time || "");
    });

    return result;
}

// Render assignment list
function renderList() {
    eventList.replaceChildren();

    const tasks = getVisibleTasks();

    if (!tasks.length) {
        eventList.appendChild(
            makeElement(
                "p",
                "empty-message",
                "No assignments found. Add an assignment or change your search."
            )
        );
        return;
    }

    tasks.forEach(task => {
        const card = makeElement(
            "article",
            `task-card${task.completed ? " completed" : ""}`
        );

        // Completion checkbox
        const checkbox = makeElement("input", "task-check");

        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.completed);

        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.title} as ${
                task.completed ? "pending" : "completed"
            }`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderList();
        });

        // Task content
        const content = makeElement("div", "task-content");

        content.appendChild(
            makeElement("h3", "task-title", task.title)
        );

        // Task metadata
        const meta = makeElement("div", "task-meta");

        meta.append(
            makeElement(
                "span",
                "category",
                categoryLabel(task.category)
            ),
            makeElement(
                "span",
                "due-date",
                `Due ${displayDate(task.date)}`
            )
        );

        content.appendChild(meta);

        // Action buttons
        const actions = makeElement("div", "task-actions");

        const detailsButton = makeElement(
            "button",
            "details-button",
            "View Details"
        );

        detailsButton.type = "button";
        detailsButton.addEventListener("click", () => {
            showDetails(task.id);
        });

        const editButton = makeElement(
            "button",
            "icon-button",
            "Edit"
        );

        editButton.type = "button";
        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteButton = makeElement(
            "button",
            "icon-button delete-button",
            "Delete"
        );

        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(detailsButton, editButton, deleteButton);

        content.appendChild(actions);
        card.append(checkbox, content);
        eventList.appendChild(card);
    });
}

// View assignment details
function showDetails(id) {
    const task = events.find(item => item.id === id);

    if (!task) return;

    detailsContent.replaceChildren();

    const details = [
        ["Assignment Title", task.title],
        ["Due Date", displayDate(task.date)],
        ["Due Time", task.time || "Not specified"],
        ["Category", categoryLabel(task.category)],
        ["Status", task.completed ? "Completed" : "Pending"]
    ];

    details.forEach(([label, value]) => {
        const item = makeElement("div", "detail-item");

        item.append(
            makeElement("strong", "", label),
            makeElement("p", "", value)
        );

        detailsContent.appendChild(item);
    });

    detailsModal.hidden = false;
    closeModalButton.focus();
}

// Close modal
function closeDetails() {
    detailsModal.hidden = true;
}

closeModalButton.addEventListener("click", closeDetails);
modalCloseBottom.addEventListener("click", closeDetails);

detailsModal.addEventListener("click", event => {
    if (event.target === detailsModal) {
        closeDetails();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !detailsModal.hidden) {
        closeDetails();
    }
});

// Edit assignment
function editTask(id) {
    localStorage.setItem("editAssignmentId", String(id));

    window.location.href = "Dashboard.html";

}
// Delete assignment
function deleteTask(id) {
    const task = events.find(item => item.id === id);

    if (!task) return;

    if (!confirm(`Delete "${task.title}"?`)) return;

    events = events.filter(item => item.id !== id);

    saveTasks();
    renderList();
}

// Filter tabs
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        activeFilter = tab.dataset.filter;

        tabs.forEach(item => {
            const selected = item === tab;

            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
        });

        renderList();
    });
});

// Search
searchInput.addEventListener("input", renderList);

// Sorting
sortInput.addEventListener("change", renderList);

// Back to Dashboard
if (backButton) {
    backButton.addEventListener("click", () => {
        window.location.href = "Dashboard.html";
    });
}

// Initial display
renderList();
