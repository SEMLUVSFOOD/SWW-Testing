const monthYearElement = document.getElementById('month-year');
const datesGrid = document.getElementById('dates');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthButton = document.getElementById('current-month');

let currentDate = new Date();

// Occupation arrays for each month of the year 2024
const occupationData = {
    "2024": {
        September: [10, 4, 6, 2, 9, 8, 10, 0, 3, 7, 1, 4, 6, 2, 9, 8, 10, 0, 3, 7, 1, 4, 6, 2, 9, 8, 10, 0, 3, 7],
        Oktober: [0, 0, 3, 7, 1, 4, 6, 10, 9, 0, 3, 7, 1, 4, 2, 1, 0, 0, 0, 0, 2, 6, 8, 10, 9, 3, 2, 1, 0, 0],
        November: [1], // No data for November, will render white boxes
        // Add more months as needed
    },
    "2025": {
        September: [10, 4, 6, 2, 9, 8, 10, 0, 3, 7, 1, 4, 6, 2, 9, 8, 10, 0, 3, 7, 1, 4, 6, 2, 9, 8, 10, 0, 3, 7],
        Oktober: [0, 0, 3, 7, 1, 4, 6, 10, 9, 0, 3, 7, 1, 4, 2, 1, 0, 0, 0, 0, 2, 6, 8, 10, 9, 3, 2, 1, 0, 0],
        November: [1], // No data for November, will render white boxes
        // Add more months as needed
    }
};

// Define the three colors
const colorFull = "#E54F37";   // Red for full occupancy
const colorNone = "#008663";    // Green for no occupancy
const colorPartial = "#F7C53A"; // Yellow for partial occupancy

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", 
                        "Juli", "Augustus", "September", "Oktober", "November", "December"];
    
    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // First day of the current month (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = firstDay.getDay();
    
    // Total number of days in the current month
    const lastDate = lastDay.getDate();

    // Get the last day of the previous month
    const prevLastDay = new Date(year, month, 0).getDate();

    // Update the month and year display
    monthYearElement.innerText = `${monthNames[month]} ${year}`;

    // Clear the grid before appending new dates
    datesGrid.innerHTML = '';

    // Add the last few days of the previous month (disabled)
    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div');
        div.classList.add('disabled');
        div.innerText = prevLastDay - x + 1;

        // Add event listener to go to the previous month
        div.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        datesGrid.appendChild(div);
    }

    // Get the occupation array for the current month
    const monthName = monthNames[month];
    const occupationArray = occupationData[year] ? occupationData[year][monthName] : null;

    // Add all the days of the current month with IDs and colors
    for (let day = 1; day <= lastDate; day++) {
        const div = document.createElement('div');
        const currentDay = new Date(year, month, day); // Get the current day object
        div.innerText = day;

        // Check if it's a weekend (Saturday or Sunday)
        const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6; // Sunday (0) or Saturday (6)
        
        if (isWeekend) {
            // Disable weekends
            div.style.backgroundColor = '#D3D3D3'; // Gray background
        } 
        else {
            // Set background color based on the occupation array or default to white if no data
            let occupationValue = null; // Default to null

            if (occupationArray) {
                occupationValue = occupationArray[day - 1]; // Access the occupation value for the day
            }
            
            // Apply colors based on occupancy
            if (occupationValue >= 1 && occupationValue <= 9) {
                div.style.backgroundColor = colorPartial; // Partial occupancy
            } else if (occupationValue === 10) {
                div.style.backgroundColor = colorFull; // Full occupancyelse if {
            } else {
                div.style.backgroundColor = colorNone; // No data for this month
            }

            // Highlight the current day
            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                div.classList.add('today');
            }
        }

        datesGrid.appendChild(div);
    }

    // Fill the rest of the grid with the first days of the next month (disabled)
    const nextDays = 7 - ((firstDayIndex + lastDate) % 7);
    if (nextDays < 7) {
        for (let i = 1; i <= nextDays; i++) {
            const div = document.createElement('div');
            div.classList.add('disabled');
            div.innerText = i;

            // Add event listener to go to the next month
            div.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar(currentDate);
            });

            datesGrid.appendChild(div);
        }
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar(currentDate);
}

function goToCurrentMonth() {
    currentDate = new Date(); // Reset to current date
    renderCalendar(currentDate);
}

// Initialize the calendar
renderCalendar(currentDate);

// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));
