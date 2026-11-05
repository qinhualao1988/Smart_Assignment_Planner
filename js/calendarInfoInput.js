// data input panel
const panelContainer = document.getElementById("calendar-input-panels")

// panel meta data array
const inputPanels = [
    {
        id: "url-panel",
        title: "Import from URL",
        description: "Read calendar information from a calendar URL."
    },
    {
        id: "upload-panel",
        title: "Upload .ics File",
        description: "Upload an .ics file to import calendar events."
    },
    {
        id: "assignment-panel",
        title: "Add Assignment",
        description: "Manually enter an assignment and its due date.",
        href: "dashboard.html"
    }
]
inputPanels.forEach(({id, title, description, href}) => {

    // create panel element <section> or <a> based on href value
    let panel
    if(href) {
        panel = document.createElement("a")
    } else {
        panel = document.createElement("section")
    }

    panel.id = id;
    panel.className = "panel input-panel";

    // setup screen reader for accessibility
    panel.setAttribute("aria-labelledby", `${id}-heading`);

    const heading = document.createElement("h2");
    heading.id = `${id}-heading`;
    heading.textContent = title;

    const summary = document.createElement("p");
    summary.textContent = description;

    panel.append(heading, summary);
    panelContainer.appendChild(panel);
})

