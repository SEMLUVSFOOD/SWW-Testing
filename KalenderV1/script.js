const monthYearElement = document.getElementById('month-year');
const datesGrid = document.getElementById('dates');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthButton = document.getElementById('current-month');

const log = document.getElementById('log');

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
    removeTimeSelection();
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

    removeTimeSelection();

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

    log.innerHTML += " // Datum geselecteerd: " + selectedDay + " - " + selectedMonth; 

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeday');

    const morningOccupation = 5 - data[selectedDay]["0"][0];
    const afternoonOccupation = 5 - data[selectedDay]["1"][0];
    // Set wholeDayOccupation to the highest of morning and afternoon occupations
    const wholeDayOccupation = Math.min(morningOccupation, afternoonOccupation);

    morning.innerHTML = `${morningOccupation}/5 beschikbaar`;
    afternoon.innerHTML = `${afternoonOccupation}/5 beschikbaar`;
    wholeDay.innerHTML = `${wholeDayOccupation}/5 beschikbaar`;

    decideAvailableTimes(morningOccupation, afternoonOccupation, wholeDayOccupation);
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

    log.innerHTML += " // Datum geselecteerd: " + currentDay + " - " + selectedMonth; 

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeday');

    const morningOccupation = 5 - data[currentDay]["0"][0];
    const afternoonOccupation = 5 - data[currentDay]["1"][0];
    // Set wholeDayOccupation to the highest of morning and afternoon occupations
    const wholeDayOccupation = Math.min(morningOccupation, afternoonOccupation);

    morning.innerHTML = `${morningOccupation}/5 beschikbaar`;
    afternoon.innerHTML = `${afternoonOccupation}/5 beschikbaar`;
    wholeDay.innerHTML = `${wholeDayOccupation}/5 beschikbaar`;

    decideAvailableTimes(morningOccupation, afternoonOccupation, wholeDayOccupation);
}

function decideAvailableTimes(morningOccupation, afternoonOccupation, wholeDayOccupation) {
    // Select the divs for each time slot
    const timeSlots = {
        morning: {
            div: document.querySelector('.morning'),
            occupation: morningOccupation,
        },
        afternoon: {
            div: document.querySelector('.afternoon'),
            occupation: afternoonOccupation,
        },
        wholeDay: {
            div: document.querySelector('.wholeday'),
            occupation: wholeDayOccupation,
        },
    };

    // Remove 'clickableTime' class from all time slot divs
    Object.values(timeSlots).forEach(({ div }) => {
        div.classList.remove('clickableTime');
        const paragraphs = div.getElementsByTagName('p');

        // Remove 'unavailable' class from all paragraphs
        Array.from(paragraphs).forEach(p => p.classList.remove('unavailable'));

        // If occupation is 0, add the 'unavailable' class
        if (div === timeSlots.morning.div && morningOccupation === 0) {
            Array.from(paragraphs).forEach(p => p.classList.add('unavailable'));
        }
        if (div === timeSlots.afternoon.div && afternoonOccupation === 0) {
            Array.from(paragraphs).forEach(p => p.classList.add('unavailable'));
        }
        if (div === timeSlots.wholeDay.div && wholeDayOccupation === 0) {
            Array.from(paragraphs).forEach(p => p.classList.add('unavailable'));
        }
    });

    // Add 'clickableTime' class only to the divs that have a non-zero occupation
    if (morningOccupation !== 0) {
        timeSlots.morning.div.classList.add('clickableTime');
    }
    if (afternoonOccupation !== 0) {
        timeSlots.afternoon.div.classList.add('clickableTime');
    }
    if (wholeDayOccupation !== 0) {
        timeSlots.wholeDay.div.classList.add('clickableTime');
    }

    addEventListenerToTimes();
}


function addEventListenerToTimes() {
    const morning = document.querySelector('.morning');
    const afternoon = document.querySelector('.afternoon');
    const wholeDay = document.querySelector('.wholeday');

    // Remove existing event listeners before adding new ones
    morning.removeEventListener('click', handleClick);
    afternoon.removeEventListener('click', handleClick);
    wholeDay.removeEventListener('click', handleClick);

    // Check for clickableTime class and add event listeners if present
    if (morning.classList.contains('clickableTime')) {
        morning.addEventListener('click', handleClick);
    }
    if (afternoon.classList.contains('clickableTime')) {
        afternoon.addEventListener('click', handleClick);
    }
    if (wholeDay.classList.contains('clickableTime')) {
        wholeDay.addEventListener('click', handleClick);
    }
}

// Function to handle the click event
function handleClick(event) {
    // Get the element that triggered the event
    const clickedElement = event.currentTarget; // This is the element that was clicked
    const morning = document.querySelector('.morning');
    const afternoon = document.querySelector('.afternoon');
    const wholeDay = document.querySelector('.wholeday');

    morning.removeAttribute('id', 'pressedleft');
    afternoon.removeAttribute('id', 'pressedmiddle');
    wholeDay.removeAttribute('id', 'pressedright');

    // Check which class the clicked element has and log a corresponding message
    if (clickedElement.classList.contains('morning')) {
        morning.setAttribute('id', 'pressedleft');
    } else if (clickedElement.classList.contains('afternoon')) {
        afternoon.setAttribute('id', 'pressedmiddle');
    } else if (clickedElement.classList.contains('wholeday')) {
        wholeDay.setAttribute('id', 'pressedright');
    }
}

function removeTimeSelection () {
    const morning = document.querySelector('.morning');
    const afternoon = document.querySelector('.afternoon');
    const wholeDay = document.querySelector('.wholeday');

    morning.removeAttribute('id', 'pressedleft');
    afternoon.removeAttribute('id', 'pressedmiddle');
    wholeDay.removeAttribute('id', 'pressedright');
}





// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));

    // Initialize the calendar
renderCalendar(currentDate);
// Initialize the TimeSelection
resetTimeSelection();
