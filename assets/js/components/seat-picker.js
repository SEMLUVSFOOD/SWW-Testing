export const seatPicker = {

	currentDate: null,
	currentTime: null,
	occupations: [],

	render() {

		//reset radios
		const radio_buttons = document.querySelectorAll('.seat_select');
		radio_buttons.forEach( radio => {
			radio.classList.remove('disabled');
		});

		//get occupation:
		const key = ( this.currentTime == 'morning' ? 0 : 1 );
		const selectedDay = this.currentDate.getDate();
		const occupation = ( 5 - this.occupations[selectedDay][key][0] ) - 1 //acount for arrays;
		//disable radios 
		for( let i = 0; i < 5; i++ ){
			console.log( i );
			if( i > occupation ){
				radio_buttons[i].classList.add( 'disabled');
			}
		}
	},

	setDate(date) {
		this.currentDate = date;
		return this;
	},

	setTime(time){
		this.currentTime = time;
		return this;
	},

	setOccupation(data) {
		this.occupations = data;
		return this;
	}
}
