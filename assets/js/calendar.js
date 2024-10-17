import { calendar } from './components/date-picker.js';
import { timePicker } from './components/time-picker.js';
import { seatPicker } from './components/seat-picker.js'; 

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

	//set the time and seat pickers on date select.
	document.addEventListener( 'dateSelected', ( event ) => {
		timePicker.setDate( event.detail.date ).render();
		seatPicker.setDate( event.detail.date )
		
		//set the date value in the input field:
		document.querySelector('#date_value').value = event.detail.value
	})

	//on time selected, pass it along to the seat picker
	document.addEventListener( 'timeSelected', ( event ) => {
		seatPicker.setTime(event.detail).render();
		document.querySelector('#time_value').value = event.detail;
	});
	
});
