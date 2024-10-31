export const totalsPicker = {
    selectedDayText: document.getElementById('selected-date-text'),
    selectedTimeText: document.getElementById('selected-time-text'),
    selectedPlaceNumbersText: document.getElementById('selected-places-text'),
    totalPriceText: document.getElementById('total-price-text'),
    paymentButton: document.querySelector('.payment-button'),

    setDateSelected(dateValue) {
        // Set the date value in the input field
        document.querySelector('#date_value').value = dateValue;

        // Convert to DD-MM-YYYY format
        let [year, month, day] = dateValue.split("-");
        let formattedDate = `${day}-${month}-${year}`;

        // Update the innerHTML for date
        this.selectedDayText.innerHTML = formattedDate;
    },

    setTimeSlotSelected(timeSelectedValue) {
        // Set the date value in the input field
        document.querySelector('#time_value').value = timeSelectedValue;

        const timeOptions = {
            morning: "Ochtend <br> (9.00 - 13.00)",
            afternoon: "Middag <br> (13.00 - 17.00)",
            wholeday: "Hele dag <br> (9.00 - 17.00)"
        };

        this.selectedTimeText.innerHTML = timeOptions[timeSelectedValue] || "";
    },

    seatSelected(seatValue) {
        // Set the seat value in the input field
        document.querySelector('#seat_value').value = seatValue;
        this.selectedPlaceNumbersText.innerHTML = seatValue;
    },

    allSelected() {
        var seats = document.querySelector('#seat_value').value;
        var timeslot = document.querySelector('#time_value').value;

        // Calculate if 2 timeslots or 1 timeslot
        var howManyTimeSlots = 0;
        if (timeslot === "wholeday") {  // Corrected to use comparison operator
            howManyTimeSlots = 2;
        } else {
            howManyTimeSlots = 1;
        }

        this.calculatePrice(seats, howManyTimeSlots); // Call the method correctly
    },

    calculatePrice(seats, howManyTimeSlots) { // Accept parameters
        // Implement the actual price calculation logic here
		const pricePerPersonPerSlot = 7.5
		var totalPrice = pricePerPersonPerSlot * howManyTimeSlots * seats;
		totalPrice = totalPrice.toFixed(2); // Round off to 2 decimal places

		this.totalPriceText.innerHTML = "€" + totalPrice;
    }
}
