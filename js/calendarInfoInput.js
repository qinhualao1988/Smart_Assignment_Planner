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
    const url = urlInput.value.trim()
    console.log(url)
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
    urlLabel.textContent = "Paste your calendar URL";

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
    homeButton.className = "back-home-button"
    homeButton.textContent = "Back to Home"

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
    uploadContent.appendChild(dropArea);

    panel.appendChild(uploadContent);

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


