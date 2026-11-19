// data input panel
const panelContainer = document.getElementById("calendar-input-panels")

// panel meta data array
const inputPanels = [
    {
        id: "url-panel",
        title: "Import from URL",
        description: "Read calendar information from a D2L calendar URL."
    },
    {
        id: "upload-panel",
        title: "Upload .ics File",
        description: "Upload an .ics file to import calendar events."
    },
    {
        id: "assignment-panel",
        title: "Add Assignment",
        description: "Manually create an assignment."
    }
]

// generate input panel
inputPanels.forEach(({id, title, description}) => {

    const panel = document.createElement('section')

    panel.id = id;
    panel.className = "panel input-panel";

    // setup screen reader for accessibility -- optional
    panel.setAttribute("aria-labelledby", `${id}-heading`);
    
    // create panel title
    const heading = document.createElement("h2");
    heading.id = `${id}-heading`;
    heading.textContent = title;

    // create panel short description
    const summary = document.createElement("p");
    summary.className = "panel-summary"
    summary.textContent = description

    panel.append(heading, summary);

    // add form and event handler in the url panel
    if (id === 'url-panel') {
        setupUrlPanel(panelContainer, panel, summary)    // this one has two helpers
    }

    // upload file panel
    if (id === "upload-panel") {
        setupUploadPanel(panelContainer, panel, summary)
    }

    // add event on new assignment panel
    if (id === 'assignment-panel') {
        setupAssignmentPanel(panelContainer, panel, summary)
    }


    panelContainer.appendChild(panel);
})

// event handler allow use click empty area to close current panel
document.addEventListener("click", function (event) {

    const clickedPanel = event.target.closest(".input-panel")
    if (clickedPanel) {
        return
    }

    const expandedPanel = panelContainer.querySelector(".is-expanded")
    if (!expandedPanel) {
        return
    }

    const summary = expandedPanel.querySelector(".panel-summary")
    const content = expandedPanel.querySelector(".panel-content")

    resetInputPanel(
        panelContainer,
        expandedPanel,
        summary,
        content
    )
    
})

/* the URL panel helpers */
function expandInputPanel(panelContainer, panel, summary, content, focusElement) {

    const isExpand = panel.classList.contains(("is-expanded"))

    if(isExpand) {
        return
    }

    // Find the currently expanded panel.
    const currentPanel = panelContainer.querySelector(".is-expanded");

    if (currentPanel) {
        // Restore the current panel's summary and hide its content.
        const currentSummary = currentPanel.querySelector(".panel-summary");
        const currentContent = currentPanel.querySelector(".panel-content");

        resetInputPanel(
            panelContainer,
            currentPanel,
            currentSummary,
            currentContent
        );
    }

    panelContainer.classList.add("has-expanded-panel")    // add class to panel container
    panel.classList.add("is-expanded")    // add class to panel

    summary.hidden = true     // summary is description in tag<p>
    content.hidden = false

    focusElement.focus()    // focus() put caret in the input box directly w/o another click
}

function handlerUrlSubmit(event, urlInput) {

    event.preventDefault()    //prevent the browser's default form submission

    const url = urlInput.value.trim()    // read user pasted url value

    /* fetch calendar information
     * send url value to 'flask'
     * correspond with @app.post("/api/calendar") in server.py
     */
    fetch("/api/calendar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({url: url})    // e.g: {url: "httpss//example.com/calendar.ics"}
    })
        .then(response => response.json())
        .then(events => {
            // handle event error
            if (events.error) {
                throw new Error(events.error)
            }

            // read existing dashboard events
            const saveEvents = JSON.parse(
                localStorage.getItem("plannerEvents") || "[]"    
            )

            // avoid add the same event
            const newEvents = events.filter(event => {
                return !saveEvents.some(savedEvent =>
                    event.sourceId &&
                    savedEvent.sourceId === event.sourceId &&
                    savedEvent.date === event.date &&
                    savedEvent.time === event.time
                )
            })

            // append imported events
            const importedEvents = saveEvents.concat(newEvents)

            // save for the dashboard
            localStorage.setItem("plannerEvents", JSON.stringify(importedEvents))

            // for testing
            console.log(JSON.stringify(events, null, 2))
            console.log("Backend returned:", events.length);
            console.log("New events after deduplication:", newEvents.length);

            const storedEvents = JSON.parse(
                localStorage.getItem("plannerEvents") || "[]"
            );

            console.log("Total saved:", storedEvents.length);
            console.table(storedEvents);

            // url import success feedback
            alert(`Calendar Imported Successfully.\nadded ${newEvents.length} new events.`)

            // transit to the dashboard page
            window.location.href = "/html/dashboard.html"
        })
        .catch(error => {
            console.error(error)
        })
}

function resetInputPanel(panelContainer, panel, summary, content) {
    panelContainer.classList.remove("has-expanded-panel")
    panel.classList.remove("is-expanded")

    summary.hidden = false
    content.hidden = true
}

// helper function for add form and event handler in the url panel
function setupUrlPanel(panelContainer, panel, summary) {

    // Create the hidden form.
    const urlForm = document.createElement("form");
    urlForm.id = "url-import-form";
    urlForm.className = "url-import-form panel-content";
    urlForm.hidden = true;

    // Create the input label.
    const urlLabel = document.createElement("label");
    urlLabel.htmlFor = "calendar-url";
    urlLabel.textContent = "Paste your D2L calendar URL";

    // Create the URL input.
    const urlInput = document.createElement("input");
    urlInput.id = "calendar-url";
    urlInput.name = "url";
    urlInput.type = "url";
    urlInput.placeholder = "https://example.com/calendar.ics";
    urlInput.required = true;

    // Create the submit button.
    const readButton = document.createElement("button");
    readButton.type = "submit";
    readButton.className = "primary";
    readButton.textContent = "Read Calendar";

    // create back-to-home button
    const homeButton = document.createElement("button")
    homeButton.type = "button"
    homeButton.className = "close-panel-button"
    homeButton.textContent = "Close"

    // Add the controls to the form.
    urlForm.appendChild(urlLabel);
    urlForm.appendChild(urlInput);
    urlForm.appendChild(readButton);
    urlForm.appendChild(homeButton)

    // Add the hidden form to the panel.
    panel.appendChild(urlForm);

    // add click handler
    panel.addEventListener("click", function() {
        expandInputPanel(panelContainer, panel, summary, urlForm, urlInput)
    })

    // add submit handler
    urlForm.addEventListener("submit", function(event) {
        handlerUrlSubmit(event, urlInput)
    })

    // add back to home button handler
    homeButton.addEventListener("click", function (e) {
        // prevent bubbling
        e.stopPropagation()

        resetInputPanel(panelContainer, panel, summary, urlForm)
    })
}

/* upload file panel */
// Create the hidden content for the upload panel.
function setupUploadPanel(panelContainer, panel, summary) {
    // allow the panel t receive focus through JS
    panel.tabIndex = -1

    // Create the hidden content container.
    const uploadContent = document.createElement("div");
    uploadContent.className = "upload-panel-content panel-content";
    uploadContent.hidden = true;

    // Create the instruction text.
    const instruction = document.createElement("p");
    instruction.textContent = "Drag your .ics file here";

    // Create the drop area.
    const dropArea = document.createElement("div");
    dropArea.className = "file-drop-area";

    // Create the plus symbol.
    const plusMark = document.createElement("span");
    plusMark.textContent = "+";

    // Assemble the upload content.
    dropArea.appendChild(plusMark);

    uploadContent.appendChild(instruction);

    setupLoadDragFeedback(panel)

    /*
     * 'dragover' event handler
     *  activate when 'dragover' a file hovering this panel
     */

    panel.addEventListener("dragover", function(e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
    })

    // 'drop' event handler
    panel.addEventListener("drop", function(e) {
        // prevent browser open file directly
        e.preventDefault()

        expandInputPanel(
            panelContainer,
            panel,
            summary,
            uploadContent,
            panel
        )

        // get dropped file
        const file = e.dataTransfer.files[0]
        handleFileUpload(file, instruction)

        // for testing
        console.log("dropped files: ", file)
    })

    uploadContent.appendChild(dropArea)

    panel.appendChild(uploadContent)

    panel.appendChild(createUploadDragOverLay())    // pass in a function

    // add event handler
    panel.addEventListener("click", function() {
        expandInputPanel(
            panelContainer,
            panel,
            summary,
            uploadContent,
            panel                 // why two panel argue??
        )
    })
}

/*--------------dragober feedback layer for file upload panel ---------------- */
function createUploadDragOverLay() {
    const overlay = document.createElement("div")
    overlay.className = "upload-drag-overlay"
    overlay.setAttribute("aria-hidden", "true")

    const icon = document.createElement("span")
    icon.className = "upload-drag-icon"
    icon.textContent = "+"    // replace it by real icon late on

    const message = document.createElement("span")
    message.textContent = "Drop your .ics file here"    // hardcode textcontent

    overlay.append(icon, message)
    return overlay
}

function setupLoadDragFeedback(panel) {
    
    let fileDragDepth = 0

    panel.addEventListener("dragenter", function(e) {
        
        // if panel not expaned and not drag a file, keep overlay hidden
        if (!panel.classList.contains("is-expanded") || !e.dataTransfer.types.includes("Files")) {
            return
        }

        // show overlay and keep traking fileDrageDepth
        fileDragDepth += 1
        panel.classList.add("is-dragging")
    })

    panel.addEventListener("dragleave", function(e) {

        fileDragDepth = Math.max(0, fileDragDepth - 1)

        if (fileDragDepth === 0) {
            panel.classList.remove("is-dragging")
        }
    })

    
    panel.addEventListener("drop", function() {
        // while drop the file, 'fileDragDepth turn to 0,
        fileDragDepth = 0
        // remove the tag to hidden the overlay
        panel.classList.remove("is-dragging")
    })
}
 
// upload panel helper function
function handleFileUpload(file, instruction) {
    // no uploaded file handling
    if(!file) {
        return
    }

    const formData = new FormData()
    formData.append("file", file)

    instruction.textContent = "Importing calendar..."

    return fetch("/api/calendar/upload", {
        method: "POST",
        body: formData
    }).then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error || "Imported Failed.")
            }

            return data
        })
    }).then(events => {
        // read existing dashboard events
        const savedEvents = JSON.parse(
            localStorage.getItem("plannerEvents") || "[]"
        )

        // avoid adding the same event
        const newEvents = events.filter(event => {
            return !savedEvents.some(savedEvents => 
                event.sourceId &&
                savedEvents.sourceId === event.sourceId &&
                savedEvents.date === event.date &&
                savedEvents.time === event.time
            )
        })

        const importedEvents = savedEvents.concat(newEvents)

        // save for the dashboard
        localStorage.setItem(
            "plannerEvents",
            JSON.stringify(importedEvents)
        )

        // file import feedback
        alert(`Imported ${newEvents.length} new events.`)

        window.location.href = "/html/dashboard.html"

    }).catch(error => {
        instruction.textContent = error.message
        console.log(error)
    })
}

/* manually add assignment panel function and related helpers */
function setupAssignmentPanel(panelContainer, panel, summary) {

    // content container
    const assignmentContent = document.createElement("div")
    assignmentContent.className = "assignment-panel-content panel-content"
    assignmentContent.hidden = true

    // instruction text
    const instruction = document.createElement("p")
    instruction.textContent = "Create a New Assignment"

    // button
    const createButton = document.createElement("button")
    createButton.type = "button"
    createButton.className = "primary"
    createButton.textContent = "Create"

    // add event handler on button
    createButton.addEventListener("click", function (e) {
        e.stopPropagation()

        openDashboardPage()
    })

    // add instruction and button t content container
    assignmentContent.appendChild(instruction)
    assignmentContent.appendChild(createButton)

    // add the hidden content to the panel
    panel.appendChild(assignmentContent)

    // add handler
    panel.addEventListener("click", function() {
        expandInputPanel(panelContainer, panel, summary, assignmentContent, createButton)
    })
}

// 3rd panel helper -- open dashboard page
function openDashboardPage() {
    window.location.href = "../html/dashboard.html"
}
