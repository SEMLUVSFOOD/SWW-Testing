import { calendar } from './components/date-picker.js';
import { timePicker } from './components/time-picker.js';
import { seatPicker } from './components/seat-picker.js'; 
import { totalsPicker } from './components/totals-picker.js'; 

//render the current month
document.addEventListener('DOMContentLoaded', () => {

	//initiate the calendar on today and render it.
	calendar.setup( new Date() ).init().render();
	timePicker.setup();

	//sync occupation data from the calendar:
	document.addEventListener( 'occupationDataLoaded', ( event ) => {
		timePicker.setOccupation( event.detail );
		seatPicker.setOccupation( event.detail );
	});

	document.addEventListener('dateSelected', (event) => {
		timePicker.setDate(event.detail.date).render();
		seatPicker.setDate(event.detail.date);

		// Update the selected Date in Totals
		var dateValue = event.detail.value;
		totalsPicker.setDateSelected(dateValue);
	});
	

	//on time selected, pass it along to the seat picker
	document.addEventListener( 'timeSelected', ( event ) => {
		seatPicker.setTime(event.detail).render();


		// Call setTotals with the dateValue
		const timeSelectedValue = event.detail;
		totalsPicker.setTimeSlotSelected(timeSelectedValue);
	});
	
	 // Add event listener for seat selection
	 document.querySelectorAll('.seat_select').forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.checked) {
				var seatValue = event.target.value;
                totalsPicker.seatSelected(seatValue);
				totalsPicker.allSelected();
            }
        });
    });
});
