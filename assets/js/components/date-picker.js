export const calendar = {

	topText: document.getElementById('month-year'),
	grid: document.getElementById('dates'),
	currentDate: null,
	monthNames: ["Januari", "Februari", "Maart", "April", "Mei", "Juni",
		"Juli", "Augustus", "September", "Oktober", "November", "December"],
	
	set( date ){
		this.currentDate = date;
		return this;
	},

	async render(){

		const year = this.currentDate.getFullYear();
		const month = this.currentDate.getMonth();

		//set all relavant variables:
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const firstDayIndex = firstDay.getDay();
		const lastDate = lastDay.getDate();
		const prevLastDay = new Date(year, month, 0).getDate();

		// Get the occupation array for the current month
		const occupationData = await this.getOccupationDataMonth( month + 1 );

		//set top text:
		this.topText.innerText = `${this.monthNames[month]} ${year}`;
		
		//reset the grid:
		this.grid.innerHTML = '';

		// Add the last few days of the previous month
		for (let x = firstDayIndex; x > 0; x--) {
			const label = prevLastDay - x + 1;
			const day = this.renderDay( label, [], true );
			this.grid.appendChild( day );
		}


		// Add all the days of the current month
		for ( let day = 1; day <= lastDate; day++ ) {
			
			// Check if it's a weekend or a past day in the current month
			const classes = [];
			let disabled = false;

			const currentDay = new Date(year, month, day);

			if( this.isWeekend( currentDay ) || this.isPast( currentDay ) ) {
				classes.push('bg--grey');
				classes.push('day--past');
				disabled = true;

			} else {

				const occupation = this.getDayOccupation( day, occupationData );
				
				// Determine the color based on the sum
				if( occupation >= 1 && occupation < 10 ) {
					classes.push('bg--yellow');
				} else if ( occupation === 10) {
					classes.push('bg--red');
					disabled = true;
				} else {
					classes.push('bg--green');
				}

				if( this.isToday( currentDay ) ){
					classes.push('selected');
				}
			}

			const btn = this.renderDay(day, classes, disabled);
			this.grid.appendChild(btn);
		}

		// Fill the rest of the grid with next month's days
		const nextDays = 7 - ( ( firstDayIndex + lastDate ) % 7 );
		if( nextDays < 7 ) {
			for ( let i = 1; i <= nextDays; i++ ) {
				const day = this.renderDay( i, [], true );
				this.grid.appendChild( day );
			}
		}

		//checkMonthLimits(); // Check if we can navigate to the next/previous month
	},

	getDayOccupation( day, occupationData ){
		// Get the occupation data for the current day and calculate the sum
		const dayData = occupationData[day];
		const morningOccupation = dayData ? dayData["0"][0] : 0;
		const afternoonOccupation = dayData ? dayData["1"][0] : 0;
		return morningOccupation + afternoonOccupation;
	},

	renderDay( label, classes = [], disabled = false ){

		const day = document.createElement('button');
		day.classList.add('day');

		//add custom classes
		for( let i = 0; i < classes.length; i++ ){
			day.classList.add( classes[i] );
		}

		day.setAttribute('disabled', disabled );
		day.innerText = label;
		return day;
	},

	isToday( day ){
		return ( this.formatDate( day ) == this.formatDate( new Date() ) )
	},
	isPast( day ){
		return this.formatDate(day) < this.formatDate(new Date());
	},
	isWeekend( day ){
		return day.getDay() === 0 || day.getDay() === 6;
	},
	formatDate( date ){
		return parseInt( date.getFullYear()+date.getMonth()+date.getDate() );
	},

	async getOccupationDataMonth( selectedMonth ) {
		const fileName = `/assets/js/data/occupationData_${selectedMonth}.json`;
		console.log( fileName );
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
}
