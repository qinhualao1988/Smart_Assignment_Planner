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

// generate input panel
inputPanels.forEach(({id, title, description, href}) => {

    // create panel element <section> or <a> based on href value
    let panel
    if(href) {
        panel = document.createElement("a")
        panel.href = href;
    } else {
        panel = document.createElement("section")
    }

    panel.id = id;
    panel.className = "panel input-panel";

    // setup screen reader for accessibility
    panel.setAttribute("aria-labelledby", `${id}-heading`);
    
    // create panel title
    const heading = document.createElement("h2");
    heading.id = `${id}-heading`;
    heading.textContent = title;

    // create panel short description
    const summary = document.createElement("p");
    summary.textContent = description;

    panel.append(heading, summary);

    //TODO: add form and event handler in the url panel
    if (id === 'url-panel') {
        setupUrlPanel(panelContainer, panel, summary)    // this one has two helpers
    }

    panelContainer.appendChild(panel);
})

/* the URL panel helpers */
function expandUrlPanel(panelContainer, panel, summary, urlForm, urlInput) {
    const isExpand = panel.classList.contains(("is-expanded"))

    if(isExpand) {
        return
    }

    panelContainer.classList.add("has-expanded-panel")    // add class to panel container
    panel.classList.add("is-expanded")    // add class to panel

    summary.hidden = true     // summary is description in tag<p>
    urlForm.hidden = false

    urlInput.focus()    // focus() put caret in the input box directly w/o another click
}

function handlerUrlSubmit(event, urlInput) {
    event.preventDefault()    //prevent the browser's default form submission

    const url = urlInput.value.trim()

    console.log(url)
}

function resetUrlpanel(panelContainer, panel, summary, urlForm) {
    panelContainer.classList.remove("has-expanded-panel")
    panel.classList.remove("is-expanded")

    summary.hidden = false
    urlForm.hidden = true
}

// helper function for add form and event handler in the url panel
function setupUrlPanel(panelContainer, panel, summary) {

    // Create the hidden form.
    const urlForm = document.createElement("form");
    urlForm.id = "url-import-form";
    urlForm.className = "url-import-form";
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
        expandUrlPanel(panelContainer, panel, summary, urlForm, urlInput)
    })

    // add submit handler
    urlForm.addEventListener("submit", function(event) {
        handlerUrlSubmit(event, urlInput)
    })

    // add back to home button handler
    homeButton.addEventListener("click", function (e) {
        // prevent bubbling
        e.stopPropagation()

        resetUrlpanel(panelContainer, panel, summary, urlForm)
    })

}



