const monthYearElement = document.getElementById('month-year');
const datesGrid = document.getElementById('dates');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthButton = document.getElementById('current-month');

var morningOccupation = 0;
var afternoonOccupation = 0;
var wholeDayOccupation = 0;

let currentlySelectedDate;
let currentlySelectedTime;
let currentlySelectedPlaceNumbers;
let totalPrice;
let wholeDay;
let whatTimeSlotisSelected;
let dayOfWeekName;


let currentDate = new Date();

const howFarinPast = 0;
const howFarinFuture = 6;

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

    const newDate = new Date;
    const currentMonth = newDate.getMonth();

    // Add the last few days of the previous month
    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div');
        div.classList.add('disabled');
        div.innerText = prevLastDay - x + 1;

        if (currentMonth != month) {
            div.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar(currentDate);
            });
        }

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

        currentlySelectedDate = new Date().getDate() + " - " + (new Date().getMonth() + 1) +  " - " + (new Date().getFullYear());
        updateTotals();

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
            
            const monthsInFutureMax = currentMonth + howFarinFuture - 12;

            if (month != monthsInFutureMax) {
                div.addEventListener('click', () => {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    renderCalendar(currentDate);
                });
            }
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
    resetPlaceNumberSelection();
    decideClickablePlaceNumbers();
}

// Check if month limits (past/future) are reached
function checkMonthLimits() {

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
    prevMonthButton.style.background = "#F093B8";
    nextMonthButton.style.background = "#F093B8";

    prevMonthButton.setAttribute('id', 'enabled');
    nextMonthButton.setAttribute('id', 'enabled');
}

// Handle date click event and update time slots
async function dateClicked(event) {

    removeTimeSelection();
    resetPlaceNumberSelection();
    decideClickablePlaceNumbers();
    
    const allAbleToPress = document.querySelectorAll('div#ableToPress');
    allAbleToPress.forEach(div => div.classList.remove('selected'));
    event.target.classList.add('selected');

    const selectedMonth = currentDate.getMonth() + 1;
    const selectedYear = currentDate.getFullYear();
    const selectedDay = event.target.innerHTML;

    console.log(currentDate);

    const data = await getOccupationDataMonth(selectedMonth);

    if (!data) {
        console.error("No data available for this month.");
        return;
    }

    currentlySelectedDate = selectedDay + " - " + selectedMonth + " - " + selectedYear;
    updateTotals();

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeday');

    morningOccupation = 5 - data[selectedDay]["0"][0];
    afternoonOccupation = 5 - data[selectedDay]["1"][0];
    // Set wholeDayOccupation to the highest of morning and afternoon occupations
    wholeDayOccupation = Math.min(morningOccupation, afternoonOccupation);

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

    const morning = document.getElementById('morning');
    const afternoon = document.getElementById('afternoon');
    const wholeDay = document.getElementById('wholeday');

    currentlySelectedTime = null;
    totalPrice = 0;
    updateTotals();

    morningOccupation = 5 - data[currentDay]["0"][0];
    afternoonOccupation = 5 - data[currentDay]["1"][0];
    // Set wholeDayOccupation to the highest of morning and afternoon occupations
    wholeDayOccupation = Math.min(morningOccupation, afternoonOccupation);

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
    morning.removeEventListener('click', handleClickTimeSlot);
    afternoon.removeEventListener('click', handleClickTimeSlot);
    wholeDay.removeEventListener('click', handleClickTimeSlot);

    // Check for clickableTime class and add event listeners if present
    if (morning.classList.contains('clickableTime')) {
        morning.addEventListener('click', handleClickTimeSlot);
    }
    if (afternoon.classList.contains('clickableTime')) {
        afternoon.addEventListener('click', handleClickTimeSlot);
    }
    if (wholeDay.classList.contains('clickableTime')) {
        wholeDay.addEventListener('click', handleClickTimeSlot);
    }
}

// Function to handle the click event
function handleClickTimeSlot(event) {
    // Get the element that triggered the event
    const clickedElement = event.currentTarget; // This is the element that was clicked
    const morning = document.querySelector('.morning');
    const afternoon = document.querySelector('.afternoon');
    const wholeDay = document.querySelector('.wholeday');

    morning.removeAttribute('id', 'pressedleft');
    afternoon.removeAttribute('id', 'pressedmiddle');
    wholeDay.removeAttribute('id', 'pressedright');

    var whatTimeSlotisSelected;

    // Check which class the clicked element has and log a corresponding message
    if (clickedElement.classList.contains('morning')) {
        morning.setAttribute('id', 'pressedleft');
        availablePlaces = morningOccupation;
        whatTimeSlotisSelected = 0;
    } else if (clickedElement.classList.contains('afternoon')) {
        afternoon.setAttribute('id', 'pressedmiddle');
        availablePlaces = afternoonOccupation;
        whatTimeSlotisSelected = 1;
    } else if (clickedElement.classList.contains('wholeday')) {
        wholeDay.setAttribute('id', 'pressedright');
        availablePlaces = wholeDayOccupation;
        whatTimeSlotisSelected = 2;
    }

    updateTotals(whatTimeSlotisSelected);
    placeNumberSelection();
    resetPlaceNumberSelection();
    decideClickablePlaceNumbers(availablePlaces);
}

function removeTimeSelection () {
    const morning = document.querySelector('.morning');
    const afternoon = document.querySelector('.afternoon');
    const wholeDay = document.querySelector('.wholeday');

    morning.removeAttribute('id', 'pressedleft');
    afternoon.removeAttribute('id', 'pressedmiddle');
    wholeDay.removeAttribute('id', 'pressedright');

    currentlySelectedTime = null;
    updateTotals();
}

function decideClickablePlaceNumbers(availablePlaces) {
    const one = document.querySelector('.one');
    const two = document.querySelector('.two');
    const three = document.querySelector('.three');
    const four = document.querySelector('.four');
    const five = document.querySelector('.five');

    one.classList.add('unavailable');
    two.classList.add('unavailable');
    three.classList.add('unavailable');
    four.classList.add('unavailable');
    five.classList.add('unavailable');

    // Remove the class if availablePlaces is 5
    if (availablePlaces === 5) {
        one.classList.remove('unavailable');
        two.classList.remove('unavailable');
        three.classList.remove('unavailable');
        four.classList.remove('unavailable');
        five.classList.remove('unavailable');
    } 
    else if (availablePlaces === 4) {
        one.classList.remove('unavailable');
        two.classList.remove('unavailable');
        three.classList.remove('unavailable');
        four.classList.remove('unavailable');
    }
    else if (availablePlaces === 3) {
        one.classList.remove('unavailable');
        two.classList.remove('unavailable');
        three.classList.remove('unavailable');
    }
    else if (availablePlaces === 2) {
        one.classList.remove('unavailable');
        two.classList.remove('unavailable');
    }
    else if (availablePlaces === 1) {
        one.classList.remove('unavailable');
    }
}


// Function to set up event listeners on the parent container
function placeNumberSelection() {
    const blockSelection = document.getElementById('placeselection');

    // Add a click event listener to the parent container
    blockSelection.addEventListener('click', (event) => {
        // Check if the clicked element is a div with one of the relevant classes
        const clickedDiv = event.target.closest('.blockselection'); // Find the closest parent div

        if (clickedDiv) {
            placeNumberSelected(clickedDiv); // Pass the clicked div to the function
        }
    });
}

// Modified placeNumberSelected function to manage IDs based on the clicked div's class
function placeNumberSelected(clickedDiv) {
    // Remove any existing IDs on all relevant divs
    resetPlaceNumberSelection();

    var whatPlaceNumberisSelected = null;

    // Assign the correct ID based on the class of the clicked div
    if (clickedDiv.classList.contains('one')) {
        clickedDiv.id = 'pressedleft';
        whatPlaceNumberisSelected = 1;
    } else if (clickedDiv.classList.contains('two')) {
        clickedDiv.id = 'pressedmiddle';
        whatPlaceNumberisSelected = 2;
    } else if (clickedDiv.classList.contains('three')) {
        clickedDiv.id = 'pressedmiddle';
        whatPlaceNumberisSelected = 3;
    } else if (clickedDiv.classList.contains('four')) {
        clickedDiv.id = 'pressedmiddle';
        whatPlaceNumberisSelected = 4;
    } else if (clickedDiv.classList.contains('five')) {
        clickedDiv.id = 'pressedright';
        whatPlaceNumberisSelected = 5;
    }

    updateTotals(whatTimeSlotisSelected, whatPlaceNumberisSelected);
}

// Function to remove IDs from all relevant divs
function resetPlaceNumberSelection() {
    const slots = ['one', 'two', 'three', 'four', 'five'];
    slots.forEach(slot => {
        const div = document.querySelector(`.${slot}`);
        if (div) {
            div.removeAttribute('id'); // Remove the ID from the div
        }
    });

    totalPrice = 0;
    updateTotals();
}


function updateTotals (whatTimeSlotisSelected, whatPlaceNumberisSelected) {
    const selectedDayText = document.getElementById('selected-date-text');
    const selectedTimeText = document.getElementById('selected-time-text');
    const selectedPlaceNumbersText = document.getElementById('selected-places-text');
    const totalPriceText = document.getElementById('total-price-text');
    const paymentButton = document.querySelector('.payment-button');


    if (!currentlySelectedTime){
        currentlySelectedTime = "x <br> <br>";
    }
    if (whatTimeSlotisSelected === 0) {
        currentlySelectedTime = "Ochtend <br> (9.00 - 13.00)";
        wholeDay = false;
    }
    else if (whatTimeSlotisSelected === 1) {
        currentlySelectedTime = "Middag <br> (13.00 - 17.00)";
        wholeDay = false;
    }
    else if (whatTimeSlotisSelected === 2) {
        currentlySelectedTime = "Hele dag <br> (9.00 - 17.00)";
        wholeDay = true;
    }

    currentlySelectedPlaceNumbers = whatPlaceNumberisSelected;

    if (!currentlySelectedPlaceNumbers){
        currentlySelectedPlaceNumbers = "x";
    }

    if (currentlySelectedDate && currentlySelectedTime != "x" && currentlySelectedPlaceNumbers != "x") {
        calculatePrice(wholeDay, currentlySelectedPlaceNumbers);
    } 

    if (totalPrice === 0){
        totalPriceText.innerHTML = "€0.00";
        paymentButton.classList.add('unavailable'); // Removes the 'unavailable' class
    }
    else if (totalPrice > 0) {
        totalPriceText.innerHTML = "€" + totalPrice;
        paymentButton.classList.remove('unavailable'); // Removes the 'unavailable' class
    }

    getDayName(currentlySelectedDate);

    selectedDayText.innerHTML = dayOfWeekName + "<br>" + currentlySelectedDate;
    selectedTimeText.innerHTML = currentlySelectedTime;
    selectedPlaceNumbersText.innerHTML = currentlySelectedPlaceNumbers;
}

function calculatePrice (wholeDay, currentlySelectedPlaceNumbers) {
    const pricePerTimeSlotPerPerson = 7.50;

    totalPrice = pricePerTimeSlotPerPerson * currentlySelectedPlaceNumbers;

    if (wholeDay) {
        totalPrice = totalPrice * 2;
    }

    totalPrice = totalPrice.toFixed(2);

    return totalPrice;
}

function getDayName (currentlySelectedDate) {
    // Split the string into day, month, and year
    const [day, month, year] = currentlySelectedDate.split(' - ');
    // Create a new Date object (months are zero-indexed, so subtract 1 from the month)
    const dateObj = new Date(year, month - 1, day);

    // Array of days of the week
    const daysOfWeek = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

    // Get the day of the week as a number (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeekNumber = dateObj.getDay();

    // Get the day of the week as a string
    dayOfWeekName = daysOfWeek[dayOfWeekNumber];

    return dayOfWeekName;
}

// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));

    // Initialize the calendar
renderCalendar(currentDate);
// Initialize the TimeSelection
resetTimeSelection();



