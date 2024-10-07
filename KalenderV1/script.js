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
        resetTimeSelection();
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
    const occupationArray = occupationData[year] ? occupationData[year][month + 1] : null;

    // Add all the days of the current month
    for (let day = 1; day <= lastDate; day++) {
        const div = document.createElement('div');
        div.innerText = day;

        // Get the necessery variables to make past days and weekends gray
        const currentDay = new Date(year, month, day);
        const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;
        const isPast = day < currentDate.getDate();
        const selectedMonth = currentDate.getMonth() + 1;
        const date = new Date();
        const currentMonth = date.getMonth() + 1;

        if (isWeekend) {
            div.style.backgroundColor = colorUnavailable;
        } 
        else if (isPast && selectedMonth === currentMonth) {
            div.style.backgroundColor = colorUnavailable;
        }
        else {
            let occupationValue = occupationArray ? occupationArray[day - 1] : null;

            if (occupationValue >= 1 && occupationValue <= 9) {
                div.style.backgroundColor = colorPartial; // Partial occupancy
            } else if (occupationValue === 10) {
                div.style.backgroundColor = colorFull; // Full occupancy
            } else {
                div.style.backgroundColor = colorNone; // No data
            }

            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                div.classList.add('selected');
            }

            div.setAttribute('id', 'ableToPress'); // add the class that makes the buttons pressable
        }



        datesGrid.appendChild(div);


        const allAbleToPress = document.querySelectorAll('div#ableToPress');
        // Loop through each element and attach the event listener
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

    checkMonthLimits(); // checks if u can go back or forwards when loading in
}

function changeMonth(offset) {  
    currentDate.setMonth(currentDate.getMonth() + offset);
    checkMonthLimits(); // Call the separate function to handle month limits
    renderCalendar(currentDate); // Re-render the calendar after changing the month
}


function goToCurrentMonth() {
    resetButtons();
    resetTimeSelection();
    currentDate = new Date();
    renderCalendar(currentDate);
}

// Fetch data and initialize the calendar
fetchOccupationData();

// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));




function checkMonthLimits() {
    const howFarinPast = 0;
    const howFarinFuture = 6;

    const newDate = new Date(); // Create a new date object based on the current date

    // Calculate the date limits based on the current date
    const MonthsAgo = new Date(); 
    MonthsAgo.setMonth(newDate.getMonth() + howFarinPast); // x months ago from current date
    const MonthsFromNow = new Date(); 
    MonthsFromNow.setMonth(newDate.getMonth() + howFarinFuture); // x months from current date

    const currentMonth = currentDate.getMonth() + 1;
    const pastMonth = MonthsAgo.getMonth() + 1;
    const futureMonth = MonthsFromNow.getMonth() + 1;

    
    resetButtons();

    if (currentMonth === pastMonth) {
        prevMonthButton.setAttribute('id', 'disabled');
        prevMonthButton.style.background = colorUnavailable;
    } 
    else if (currentMonth === futureMonth) {
        nextMonthButton.setAttribute('id', 'disabled');
        nextMonthButton.style.background = colorUnavailable;
    }
}


function resetButtons() {
    prevMonthButton.style.background = "#6658A2";
    nextMonthButton.style.background = "#6658A2";

    prevMonthButton.setAttribute('id', 'enabled');
    nextMonthButton.setAttribute('id', 'enabled');
}







// START OF THE TIMESELECTION

async function dateClicked(event) {

    // Remove "selected" class from all buttons
    const allAbleToPress = document.querySelectorAll('div#ableToPress');

    allAbleToPress.forEach(div => {
        div.classList.remove('selected');
    });
 
    // Add "selected" class to the button that was clicked
    event.target.classList.add('selected');
 
    const selectedMonth = currentDate.getMonth() + 1;
    const selectedDay = event.target.innerHTML;

    const selectedDate = document.getElementById('selected-date');
    selectedDate.innerHTML = "Datum geselecteerd:" + selectedDay + "-" + selectedMonth;

    // Fetch the data using the separate function
    const data = await getOccupationDataMonth(selectedMonth);

    if (!data) {
        console.error("No data available for this month.");
    } 

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeDay');

    morningOccupation = data[selectedDay]["0"][0];
    afternoonOccupation = data[selectedDay]["1"][0];
    wholeDayOccupation = morningOccupation + afternoonOccupation;

    morning.innerHTML = "Ochtend bezet: " + morningOccupation + "/5"
    afternoon.innerHTML = "Middag bezet: " + afternoonOccupation + "/5"
    wholeDay.innerHTML = "Hele Dag bezet: " + wholeDayOccupation + "/10"


}


async function getOccupationDataMonth(selectedMonth) {
    const fileName = `occupationData_${selectedMonth}.json`;
    
    try {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch data: ', error);
        return null; // Return null or handle the error in some way
    }
}



async function resetTimeSelection(event) {

    const selectedMonth = currentDate.getMonth() + 1;

    // Fetch the data using the separate function
    const data = await getOccupationDataMonth(selectedMonth);

    if (!data) {
        console.error("No data available for this month.");
    }

    const newDate = new Date(); // Create a new date object based on the current date
    const currentDay = newDate.getDate();
    const currentMonth = newDate.getMonth() + 1;

    const selectedDate = document.getElementById('selected-date');
    selectedDate.innerHTML = "Datum geselecteerd:" + currentDay + "-" + currentMonth;

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeDay');

    morningOccupation = data[currentDay]["0"][0];
    afternoonOccupation = data[currentDay]["1"][0];
    wholeDayOccupation = morningOccupation + afternoonOccupation;

    morning.innerHTML = "Ochtend bezet: " + morningOccupation + "/5"
    afternoon.innerHTML = "Middag bezet: " + afternoonOccupation + "/5"
    wholeDay.innerHTML = "Hele Dag bezet: " + wholeDayOccupation + "/10"

}