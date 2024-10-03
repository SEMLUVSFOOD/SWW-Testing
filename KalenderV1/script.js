const monthYearElement = document.getElementById('month-year');
const datesGrid = document.getElementById('dates');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthButton = document.getElementById('current-month');

let currentDate = new Date();
let occupationData = {};  // Now empty, data will be fetched dynamically

// Define the three colors
const colorFull = "#E54F37";   // Red for full occupancy
const colorNone = "#008663";    // Green for no occupancy
const colorPartial = "#F7C53A"; // Yellow for partial occupancy
const colorUnavailable = "#D3D3D3"; // Gray for weekends and other unavailable days

// Function to fetch the JSON data
async function fetchOccupationData() {
    try {
        const response = await fetch('occupationData.json'); // Get the date, await makes it so it pauses everthing untill data is loaded
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        occupationData = await response.json();
        renderCalendar(currentDate); // Call renderCalendar after fetching data
    } catch (error) {
        console.error('Error loading occupation data:', error);
    }
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", 
                        "Juli", "Augustus", "September", "Oktober", "November", "December"]; // Array used in combination with the month const
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0); // The +1 to go to next month, 0 to select the 0th day of that month basically meaning last day of last month
    const firstDayIndex = firstDay.getDay(); //Check what day the first day is, sunday would be 0, monday 1 etc.
    const lastDate = lastDay.getDate(); // Get the amount of days in the currently displaying month
    const prevLastDay = new Date(year, month, 0).getDate(); // Last day of Previous Month to fill in the grayed out areas

    monthYearElement.innerText = `${monthNames[month]} ${year}`;
    datesGrid.innerHTML = '';

    // Add the last few days of the previous month, it starts with generating the first block. That's the formula with the !!!!
    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div'); // 1. Create a new <div> element for each day
        div.classList.add('disabled'); // 2. Add a 'disabled' class to these days (to style them differently from the current month)
        div.innerText = prevLastDay - x + 1; // 3. Calculate and display the correct day number from the previous month !!!!!
        
        // 4. Add an event listener that, when clicked, will switch to the previous month
        div.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1); // Move to the previous month
            renderCalendar(currentDate); // Re-render the calendar for the new month
        });

        // 5. Append the newly created div to the grid of dates in the calendar
        datesGrid.appendChild(div);
    }


    // Get the occupation array for the current month
    const monthName = monthNames[month];
    const occupationArray = occupationData[year] ? occupationData[year][monthName] : null;

    // Add all the days of the current month
    for (let day = 1; day <= lastDate; day++) {
        const div = document.createElement('div');
        div.innerText = day;

        const currentDay = new Date(year, month, day);
        const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;

        if (isWeekend) {
            div.style.backgroundColor = colorUnavailable;
        } else {
            let occupationValue = occupationArray ? occupationArray[day - 1] : null;

            if (occupationValue >= 1 && occupationValue <= 9) {
                div.style.backgroundColor = colorPartial; // Partial occupancy
            } else if (occupationValue === 10) {
                div.style.backgroundColor = colorFull; // Full occupancy
            } else {
                div.style.backgroundColor = colorNone; // No data
            }

            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                div.classList.add('today');
            }
        }

        datesGrid.appendChild(div);
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
}

function changeMonth(offset) {  
    const isLimitReached = limitReachedChecker();
    if (!isLimitReached) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        renderCalendar(currentDate);
    }
}


function goToCurrentMonth() {
    currentDate = new Date();
    renderCalendar(currentDate);
}

// Fetch data and initialize the calendar
fetchOccupationData();

// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));


function limitReachedChecker() {
    const newDate = new Date(); // Create a new date object based on the current date
    
    // Calculate the date limits based on the current date
    const sixMonthsAgo = new Date(); 
    sixMonthsAgo.setMonth(newDate.getMonth() - 1); // Six months ago from current date
    const sixMonthsFromNow = new Date(); 
    sixMonthsFromNow.setMonth(newDate.getMonth() + 6); // Six months from current date

    // Initialize the isLimitReached variable
    let isLimitReached = false; // Set the default value

    // Check if the new date is within the allowed range
    if (currentDate < sixMonthsAgo) {
        isLimitReached = true;
        alert("Verder terug kan helaas niet");
    }
    else if (currentDate > sixMonthsFromNow) {
        isLimitReached = true;
        alert("Verder dan 6 maanden in de toekomst kan je niet boeken");
    }

    return isLimitReached;
}