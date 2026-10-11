/* ==========================================
   PRAYASQUEUE DIGITAL TOKEN SYSTEM
========================================== */

// TOKEN NUMBERS FOR EACH SERVICE
const tokenNumbers = {
    B: 0,
    F: 0,
    E: 0,
    D: 0
};

// QUEUE DATA
let waitingTokens = [];
let currentServingToken = null;
let servedTokens = [];
let lastGeneratedToken = null;

// SERVICE NAMES
const serviceNames = {
    B: "Bonafide Certificate",
    F: "Fee Related Query",
    E: "Examination Form",
    D: "Document Verification"
};

// DISPLAY HELPER
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// GENERATE A NEW TOKEN
function generateToken() {
    const nameInput = document.getElementById("studentName");
    const serviceInput = document.getElementById("service");

    const studentName = nameInput.value.trim();
    const service = serviceInput.value;

    // Validate name
    if (studentName === "") {
        alert("Please enter your name.");
        nameInput.focus();
        return;
    }

    // Validate service
    if (!service || !serviceNames[service]) {
        alert("Please select a service.");
        serviceInput.focus();
        return;
    }

    // Create service-specific token number
    tokenNumbers[service]++;

    const token =
        service + "-" +
        String(tokenNumbers[service]).padStart(3, "0");

    // Store student details
    const student = {
        name: studentName,
        token: token,
        service: serviceNames[service],
        status: "Waiting"
    };

    // Add student to queue
    waitingTokens.push(student);

    // Remember the latest token generated
    lastGeneratedToken = token;

    // Display generated token
    setText("generatedToken", token);
    setText("yourToken", token);
    setText("serviceName", student.service);
    setText("tokenStatus", "Status: Waiting");

    // Clear form
    nameInput.value = "";
    serviceInput.value = "";

    // Update the whole interface
    updateDashboard();

    setText(
        "queueStatus",
        token + " added to the waiting queue."
    );

    // Scroll to the generated token
    document.getElementById("tokenResult")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}

// CALL THE NEXT STUDENT
function nextToken() {

    // A student is already being served
    if (currentServingToken !== null) {
        alert(
            "Please mark the current token as served first."
        );
        return;
    }

    // No students waiting
    if (waitingTokens.length === 0) {
        setText("queueStatus", "No students are waiting.");
        alert("No students are waiting.");
        return;
    }

    // Take the first student in the queue
    currentServingToken = waitingTokens.shift();

    currentServingToken.status = "Currently Serving";

    // Update dashboard
    updateDashboard();

    setText(
        "queueStatus",
        currentServingToken.token +
        " is now being served."
    );
}

// MARK THE CURRENT STUDENT AS SERVED
function serveToken() {

    // Nothing is currently being served
    if (currentServingToken === null) {
        alert("No token is currently being served.");
        return;
    }

    // Save completed token in served history
    const completedStudent = {
        ...currentServingToken,
        status: "Served"
    };

    servedTokens.push(completedStudent);

    const completedToken = completedStudent.token;

    // Clear the current student
    currentServingToken = null;

    // Update everything immediately
    updateDashboard();

    setText(
        "queueStatus",
        completedToken +
        " has been served successfully. You can call the next token."
    );
}

// UPDATE THE ENTIRE DASHBOARD
function updateDashboard() {

    // Current token display
    const currentToken = currentServingToken
        ? currentServingToken.token
        : "--";

    setText("currentToken", currentToken);
    setText("staffCurrentToken", currentToken);

    // Current service display
    setText(
        "currentService",
        currentServingToken
            ? currentServingToken.service
            : "No student being served"
    );

    // Waiting counts
    setText("waitingCount", waitingTokens.length);
    setText("tableWaitingCount", waitingTokens.length);

    // Served information
    setText("servedCount", servedTokens.length);

    setText(
        "lastServedToken",
        servedTokens.length > 0
            ? servedTokens[servedTokens.length - 1].token
            : "--"
    );

    // Refresh waiting list
    updateWaitingList();

    // Refresh latest generated token's status
    updateLatestTokenStatus();
}

// UPDATE WAITING STUDENTS TABLE
function updateWaitingList() {
    const tableBody = document.getElementById("waitingList");

    if (!tableBody) return;

    // Clear old rows
    tableBody.replaceChildren();

    // Display empty queue message
    if (waitingTokens.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty-message";
        cell.textContent = "No students are waiting.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    // Add every waiting student to the table
    waitingTokens.forEach(function(student) {
        const row = document.createElement("tr");

        const tokenCell = document.createElement("td");
        tokenCell.textContent = student.token;
        tokenCell.className = "token-cell";

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const serviceCell = document.createElement("td");
        serviceCell.textContent = student.service;

        const statusCell = document.createElement("td");
        statusCell.textContent = "Waiting";
        statusCell.className = "status-waiting";

        row.append(
            tokenCell,
            nameCell,
            serviceCell,
            statusCell
        );

        tableBody.appendChild(row);
    });
}

// UPDATE THE LATEST GENERATED TOKEN'S POSITION
function updateLatestTokenStatus() {

    if (!lastGeneratedToken) {
        setText("positionText", "Generate a token first.");
        setText("waitTime", "--");
        return;
    }

    // Check if the token is still waiting
    const waitingIndex = waitingTokens.findIndex(
        student => student.token === lastGeneratedToken
    );

    if (waitingIndex !== -1) {
        const position = waitingIndex + 1;

        setText(
            "positionText",
            "Position: " + position + " in queue"
        );

        setText("waitTime", (position * 5) + " min");
        setText("tokenStatus", "Status: Waiting");
        return;
    }

    // Check if the token is being served
    if (
        currentServingToken &&
        currentServingToken.token === lastGeneratedToken
    ) {
        setText("positionText", "It is your turn!");
        setText("waitTime", "Now");
        setText("tokenStatus", "Status: Currently Serving");
        return;
    }

    // Check if the token has been served
    const completedStudent = servedTokens.find(
        student => student.token === lastGeneratedToken
    );

    if (completedStudent) {
        setText("positionText", "Service completed");
        setText("waitTime", "Completed");
        setText("tokenStatus", "Status: Served");
        return;
    }

    setText("positionText", "Queue status unavailable");
    setText("waitTime", "--");
}

// INITIALISE DASHBOARD
updateDashboard();