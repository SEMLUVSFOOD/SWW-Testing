const monthYearElement = document.getElementById('month-year');
const datesGrid = document.getElementById('dates');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthButton = document.getElementById('current-month');

let currentDate = new Date();

// Define the three colors
const colorFull = "#E54F37";   // Red for full occupancy
const colorNone = "#008663";    // Green for no occupancy
const colorPartial = "#F7C53A"; // Yellow for partial occupancy
const colorUnavailable = "#D3D3D3"; // Gray for weekends and other unavailable days

// Function to render the calendar
async function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", 
                        "Juli", "Augustus", "September", "Oktober", "November", "December"];
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    monthYearElement.innerText = `${monthNames[month]} ${year}`;
    datesGrid.innerHTML = '';

    // Add the last few days of the previous month
    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div');
        div.classList.add('disabled');
        div.innerText = prevLastDay - x + 1;
        div.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
        datesGrid.appendChild(div);
    }

    // Get the occupation array for the current month
    const occupationData = await getOccupationDataMonth(month + 1); // Fetch occupation data for the current month

    // Add all the days of the current month
    for (let day = 1; day <= lastDate; day++) {
        const div = document.createElement('div');
        div.innerText = day;

        // Check if it's a weekend or a past day in the current month
        const currentDay = new Date(year, month, day);
        const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;
        const isPast = day < currentDate.getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

        if (isWeekend || isPast) {
            div.style.backgroundColor = colorUnavailable;
        } else {
            // Get the occupation data for the current day and calculate the sum
            const dayData = occupationData[day];
            const morningOccupation = dayData ? dayData["0"][0] : 0;
            const afternoonOccupation = dayData ? dayData["1"][0] : 0;
            const sum = morningOccupation + afternoonOccupation;

            // Determine the color based on the sum
            if (sum >= 1 && sum < 10) {
                div.style.backgroundColor = colorPartial; // Partial occupancy
            } else if (sum === 10) {
                div.style.backgroundColor = colorFull; // Full occupancy
            } else {
                div.style.backgroundColor = colorNone; // No data (or 0 occupancy)
            }

            // Highlight the current day
            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                div.classList.add('selected');
            }

            div.setAttribute('id', 'ableToPress');
        }

        datesGrid.appendChild(div);

        // Add event listeners to selectable days
        const allAbleToPress = document.querySelectorAll('div#ableToPress');
        allAbleToPress.forEach(div => {
            div.addEventListener("click", dateClicked);
        });
    }

    // Fill the rest of the grid with next month's days
    const nextDays = 7 - ((firstDayIndex + lastDate) % 7);
    if (nextDays < 7) {
        for (let i = 1; i <= nextDays; i++) {
            const div = document.createElement('div');
            div.classList.add('disabled');
            div.innerText = i;
            div.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar(currentDate);
            });
            datesGrid.appendChild(div);
        }
    }

    checkMonthLimits(); // Check if we can navigate to the next/previous month
}

// Function to change the month
function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    checkMonthLimits();
    renderCalendar(currentDate);
}

// Function to reset and go to the current month
function goToCurrentMonth() {
    resetButtons();
    currentDate = new Date();
    renderCalendar(currentDate);
    resetTimeSelection();
}

// Check if month limits (past/future) are reached
function checkMonthLimits() {
    const howFarinPast = 0;
    const howFarinFuture = 6;

    const newDate = new Date();
    const MonthsAgo = new Date();
    MonthsAgo.setMonth(newDate.getMonth() + howFarinPast);
    const MonthsFromNow = new Date();
    MonthsFromNow.setMonth(newDate.getMonth() + howFarinFuture);

    const currentMonth = currentDate.getMonth() + 1;
    const pastMonth = MonthsAgo.getMonth() + 1;
    const futureMonth = MonthsFromNow.getMonth() + 1;

    resetButtons();

    if (currentMonth === pastMonth) {
        prevMonthButton.setAttribute('id', 'disabled');
        prevMonthButton.style.background = colorUnavailable;
    } else if (currentMonth === futureMonth) {
        nextMonthButton.setAttribute('id', 'disabled');
        nextMonthButton.style.background = colorUnavailable;
    }
}

// Reset the buttons for month navigation
function resetButtons() {
    prevMonthButton.style.background = "#6658A2";
    nextMonthButton.style.background = "#6658A2";

    prevMonthButton.setAttribute('id', 'enabled');
    nextMonthButton.setAttribute('id', 'enabled');
}

// Handle date click event and update time slots
async function dateClicked(event) {
    const allAbleToPress = document.querySelectorAll('div#ableToPress');
    allAbleToPress.forEach(div => div.classList.remove('selected'));
    event.target.classList.add('selected');

    const selectedMonth = currentDate.getMonth() + 1;
    const selectedDay = event.target.innerHTML;

    const data = await getOccupationDataMonth(selectedMonth);

    if (!data) {
        console.error("No data available for this month.");
        return;
    }

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeday');

    const morningOccupation = data[selectedDay]["0"][0];
    const afternoonOccupation = data[selectedDay]["1"][0];
    const wholeDayOccupation = morningOccupation + afternoonOccupation;

    morning.innerHTML = `${morningOccupation}/5 bezet`;
    afternoon.innerHTML = `${afternoonOccupation}/5 bezet`;
    wholeDay.innerHTML = `${wholeDayOccupation}/10 bezet`;
}

// Fetch occupation data for a given month
async function getOccupationDataMonth(selectedMonth) {
    const fileName = `occupationData_${selectedMonth}.json`;
    try {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return null;
    }
}

// Reset time selection to the current day
async function resetTimeSelection() {
    const selectedMonth = currentDate.getMonth() + 1;
    const data = await getOccupationDataMonth(selectedMonth);

    if (!data) {
        console.error("No data available for this month.");
        return;
    }

    const currentDay = new Date().getDate();

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeday');

    const morningOccupation = data[currentDay]["0"][0];
    const afternoonOccupation = data[currentDay]["1"][0];
    const wholeDayOccupation = morningOccupation + afternoonOccupation;

    morning.innerHTML = `${morningOccupation}/5 bezet`;
    afternoon.innerHTML = `${afternoonOccupation}/5 bezet`;
    wholeDay.innerHTML = `${wholeDayOccupation}/10 bezet`;
}

// Initialize the calendar
renderCalendar(currentDate);
// Initialize the TimeSelection
resetTimeSelection();

// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));
