document.addEventListener("DOMContentLoaded", () => {
    const dateTime = document.getElementById("datePicker");
    const loadingIndicator = document.getElementById("loading");
    const errorElement = document.getElementById("error");
    const button = document.getElementById("btnShow");

    const date = new Date();
    const pad = (num) => num.toString().padStart(2, '0'); // Ensures two-digit day and month

    // Set the default date picker value to today's date (yyyy-MM-dd)
    dateTime.value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    button.addEventListener("click", fetchAndShowXariciValyutalar);

    async function fetchAndShowXariciValyutalar() {
        // Clear previous errors and results
        errorElement.style.display = "none";
        errorElement.textContent = "";
        const existingTable = document.getElementById("show-table");
        if (existingTable) existingTable.remove();

        // Show loading indicator and disable button
        loadingIndicator.style.display = "block";
        button.disabled = true;

        try {
            const selectedDate = dateTime.value; // Use the date selected by the user
            if (!selectedDate) {
                alert("Please select a date.");
                return;
            }

            // Format the date as required (dd.mm.yyyy)
            const dateParts = selectedDate.split("-");
            const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

            // Fetch data from the server
            const response = await fetch(`https://currency-eqj6.onrender.com/proxy/${formattedDate}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");

            // Find the "ValType" element with type="Xarici valyutalar"
            const valTypeElement = xmlDoc.querySelector('ValType[Type="Xarici valyutalar"]');

            if (valTypeElement) {
                // Create a table to display the data
                const table = document.createElement("table");
                table.id = "show-table";
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Currency Code</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                `;
                const tbody = document.createElement("tbody");

                const valuteElements = valTypeElement.querySelectorAll("Valute");
                valuteElements.forEach(valute => {
                    const code = valute.getAttribute("Code") || "N/A";
                    const value = valute.querySelector("Value")?.textContent || "N/A";
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${code}</td><td>${value}</td>`;
                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                document.body.appendChild(table);
            } else {
                errorElement.textContent = 'No "Xarici valyutalar" data found in the XML.';
                errorElement.style.display = "block";
            }
        } catch (error) {
            console.error("Error fetching or parsing XML:", error);
            errorElement.textContent = "An error occurred while fetching data. Please try again.";
            errorElement.style.display = "block";
        } finally {
            // Hide loading indicator and enable button
            loadingIndicator.style.display = "none";
            button.disabled = false;
        }
    }

    // Automatically fetch data for today's date when the document is loaded
    fetchAndShowXariciValyutalar();
});
