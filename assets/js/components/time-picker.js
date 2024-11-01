export const timePicker = {

	currentDate: null,
	occupations: [],

	setup(){
		const self = this;
		document.querySelectorAll('.daytime').forEach( button => {
			button.addEventListener( 'click', self.setTime );
		});
	},

	render(){
		const selectedDay = this.currentDate.getDate();

		let morningOccupation = 5 - this.occupations[selectedDay]["0"][0];
		let afternoonOccupation = 5 - this.occupations[selectedDay]["1"][0];
		// Set wholeDayOccupation to the highest of morning and afternoon occupations
		let wholeDayOccupation = Math.min( morningOccupation, afternoonOccupation);

		// Select the divs for each time slot
		const timeSlots = {
			morning: {
				element: document.querySelector('[data-type="morning"]'),
				occupation: morningOccupation,
			},
			afternoon: {
				element: document.querySelector('[data-type="afternoon"]'),
				occupation: afternoonOccupation,
			},
			wholeDay: {
				element: document.querySelector('[data-type="wholeday"]'),
				occupation: wholeDayOccupation,
			},
		};

		Object.values(timeSlots).forEach(( slot ) => {

			//reset
			slot.element.removeAttribute('disabled');

			//set availability text:
			let availability = slot.occupation+"/5 beschikbaar";
			if( slot.occupation <= 0 ){
				availability = 'niet beschikbaar';
				//also set as unavailable
				slot.element.setAttribute('disabled', true );
			}

			slot.element.querySelector('.availability').innerHTML = availability;
		});

	},

	setTime(evt) {
		const type = evt.currentTarget.dataset.type;
		
		// Remove any of the 'pressed' classes from all elements
		document.querySelectorAll('.blockselection').forEach(element => {
			element.classList.remove('pressedleft', 'pressedmiddle', 'pressedright');
		});
		
		// Add the specific 'pressed' class based on the type
		if (type === "morning") {
			evt.currentTarget.classList.add('pressedleft');
		} else if (type === "afternoon") {
			evt.currentTarget.classList.add('pressedmiddle');
		} else if (type === "wholeday") {
			evt.currentTarget.classList.add('pressedright');
		}
		
		// Dispatch the custom event with the selected time type
		const event = new CustomEvent("timeSelected", { detail: type });
		document.dispatchEvent(event);
	},

	setDate( date ){
		this.currentDate = date;
		return this;
	},

	setOccupation( data ){
		this.occupations = data;
		return this;
	}
}
