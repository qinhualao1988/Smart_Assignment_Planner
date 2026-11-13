# Smart Assignment Planner

Smart Assignment Planner helps students organize classes, assignments, exams, and other events through calendar and list views.

The application supports importing calendars through a URL and manually adding, editing, and deleting events. Local `.ics` file upload is under development.

## Setup and Run

Run the following commands in Windows PowerShell.

### 1. Open the repository directory

Open a terminal in the repository root, where `server.py` is located. Run the following commands from this directory.

### 2. Create and activate a virtual environment (Optional)

A virtual environment keeps this project's dependencies separate from other Python projects.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
py -m pip install flask requests icalendar
```

### 4. Start the server

```powershell
py server.py
```

Open the following address in your browser:

```text
http://127.0.0.1:5000/
```

Keep the terminal open while using the application. Press `Ctrl+C` to stop the server.
