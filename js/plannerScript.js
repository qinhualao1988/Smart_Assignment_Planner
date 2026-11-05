const form = document.getElementById("event-form");
const titleInput = document.getElementById("event-title");
const dateInput = document.getElementById("event-date");
const timeInput = document.getElementById("event-time");
const categoryInput = document.getElementById("event-category");

const calendarGrid = document.getElementById("calendar-grid");
const eventList = document.getElementById("event-list");
const heading = document.getElementById("view-heading");

const calendarView = document.getElementById("calendar-view");
const listView = document.getElementById("list-view");

const calendarButton = document.getElementById("calendar-button");
const listButton = document.getElementById("list-button");

const today = new Date();

let displayedMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);

let editingEventId = null;

// Retain inputs between sessions
const STORAGE_KEY = "plannerEvents";
function loadEvents() {
    try {
        const savedEvents = localStorage.getItem(STORAGE_KEY);
        if (savedEvents === null) {
            return [];
        }

        const parsedEvents = JSON.parse(savedEvents);
        return Array.isArray(parsedEvents) ? parsedEvents : [];
    } catch (error) {
        console.error("Saved events could not be loaded:", error);
        return [];
    }
}
let events = loadEvents();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.value = formatDate(today);

function formatDisplayDate(dateString) {
    return new Date(dateString + "T12:00:00").toLocaleDateString(
        undefined,
        {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}

function sortedEvents() {
    return [...events].sort((a, b) =>
        a.date.localeCompare(b.date) ||
        a.time.localeCompare(b.time) ||
        a.id - b.id
    );
}

function createEventElement(event) {
    const element = document.createElement("div");
    element.className = `event ${event.category}`;

    const time = document.createElement("span");
    time.className = "event-time";
    time.textContent = event.time ? event.time + " " : "";

    const title = document.createElement("span");
    title.textContent = event.title;

    element.append(time, title);
    element.title = event.title;

    return element;
}

function renderCalendar() {
    calendarGrid.replaceChildren();

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    heading.textContent = displayedMonth.toLocaleDateString(
        undefined,
        { month: "long", year: "numeric" }
    );

    const weekdays = [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ];

    weekdays.forEach(day => {
        const label = document.createElement("div");
        label.className = "weekday";
        label.textContent = day;
        calendarGrid.appendChild(label);
    });

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells before the first day of the month.
    for (let i = 0; i < firstWeekday; i++) {
        const empty = document.createElement("div");
        empty.className = "day empty";
        empty.setAttribute("aria-hidden", "true");
        calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);

        const cell = document.createElement("div");
        cell.className = "day";

        if (dateString === formatDate(today)) {
            cell.classList.add("today");
        }

        const number = document.createElement("div");
        number.className = "day-number";
        number.textContent = day;
        cell.appendChild(number);

        const dayEvents = sortedEvents().filter(
            event => event.date === dateString
        );

        dayEvents.forEach(event => {
            cell.appendChild(createEventElement(event));
        });

        calendarGrid.appendChild(cell);
    }
}

function renderList() {
    eventList.replaceChildren();

    const upcoming = sortedEvents().filter(
        event => event.date >= formatDate(today)
    );

    if (upcoming.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No upcoming events yet.";
        eventList.appendChild(message);
        return;
    }

    upcoming.forEach(event => {
        const item = document.createElement("article");
        item.className = "list-event";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = event.title;

        const date = document.createElement("p");
        date.textContent = formatDisplayDate(event.date);

        const category = document.createElement("p");
        category.textContent =
            event.category.charAt(0).toUpperCase() +
            event.category.slice(1);

        details.append(title, date, category);

        if (event.time) {
            const time = document.createElement("p");
            time.textContent = event.time;
            details.appendChild(time);
        }

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", () => {
            editEvent(event.id);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-button";

        removeButton.addEventListener("click", () => {
            removeEvent(event.id);
        });

        item.append(details, editButton, removeButton);
        eventList.appendChild(item);
    });
}

function removeEvent(eventId) {
    const selectedEvent = events.find(
        event => event.id === eventId
    );

    if (!selectedEvent) return;

    const confirmed = confirm(
        `Are you sure you want to delete "${selectedEvent.title}"?`
    );

    if (!confirmed) return;

    events = events.filter(event => event.id !== eventId);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );

    render();

    alert("Task successfully deleted");
}

function editEvent(eventId) {
    const selectedEvent = events.find(
        event => event.id === eventId
    );

    if (!selectedEvent) return;

    editingEventId = eventId;

    titleInput.value = selectedEvent.title;
    dateInput.value = selectedEvent.date;
    timeInput.value = selectedEvent.time;
    categoryInput.value = selectedEvent.category;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = "Save Changes";

    titleInput.focus();
}

function render() {
    renderCalendar();
    renderList();
}

function setView(view) {
    const showCalendar = view === "calendar";

    calendarView.hidden = !showCalendar;
    listView.hidden = showCalendar;

    calendarButton.classList.toggle("active", showCalendar);
    listButton.classList.toggle("active", !showCalendar);

    calendarButton.setAttribute(
        "aria-pressed", String(showCalendar)
    );

    listButton.setAttribute(
        "aria-pressed", String(!showCalendar)
    );
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const newEvent = {
        id: editingEventId !== null ? editingEventId : Date.now(),
        title: titleInput.value.trim(),
        date: dateInput.value,
        time: timeInput.value,
        category: categoryInput.value
    };

    if (!newEvent.title || !newEvent.date) return;

    let successMessage;

    if(editingEventId !== null) {
        events = events.map(event =>
            event.id === editingEventId ? newEvent : event
        );

        successMessage = "Item successfully updated!";
        editingEventId = null;
    } else {
    events.push(newEvent);

    successMessage = "Task successfully added!";

    }
    console.log("Event added:", newEvent);
    console.log("Events before saving:", events);
    // Save array of updated events
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );

    console.log(
        "Saved events:",
        localStorage.getItem(STORAGE_KEY)
    );
    // Updated event array is saved to localStorage
    //localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

    // Display the month containing the newly added event.
    const [year, month] = newEvent.date.split("-").map(Number);
    displayedMonth = new Date(year, month - 1, 1);

    render();
    setView("calendar");
    alert(successMessage);

    form.reset();
    editingEventId = null;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = "Add"
    dateInput.value = formatDate(today);
    titleInput.focus();
});

calendarButton.addEventListener("click", () => {
    setView("calendar");
});

listButton.addEventListener("click", () => {
    setView("list");
});

document.getElementById("previous-month")
    .addEventListener("click", () => {
        displayedMonth.setMonth(displayedMonth.getMonth() - 1);
        render();
    });

document.getElementById("next-month")
    .addEventListener("click", () => {
        displayedMonth.setMonth(displayedMonth.getMonth() + 1);
        render();
    });

document.getElementById("today-button")
    .addEventListener("click", () => {
        displayedMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
        render();
    });

// Draw the initial calendar and list.
render();
