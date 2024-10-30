export const seatPicker = {
    currentDate: null,
    currentTime: null,
    occupations: [],
    selectedSeat: null, // Add this line to define selectedSeat

    render() {
        // Reset radios
        const radio_buttons = document.querySelectorAll('.seat_select');
        radio_buttons.forEach(radio => {
            radio.classList.remove('disabled');
            radio.checked = false; // Resetting the checked state
        });

        // Get occupation:
        const key = (this.currentTime == 'morning' ? 0 : 1);
        const selectedDay = this.currentDate.getDate();
        const occupation = (5 - this.occupations[selectedDay][key][0]) - 1; // Account for arrays;

        // Disable radios 
        for (let i = 0; i < 5; i++) {
            if (i > occupation) {
                radio_buttons[i].classList.add('disabled');
            }
        }

        // Mark the currently selected radio button
        if (this.selectedSeat !== null) {
            const selectedRadio = document.querySelector(`.seat_select[value="${this.selectedSeat}"]`);
            if (selectedRadio) {
                selectedRadio.checked = true; // Mark the selected seat
            }
        }
    },

    setDate(date) {
        this.currentDate = date;
        return this;
    },

    setTime(time) {
        this.currentTime = time;
        return this;
    },

    setOccupation(data) {
        this.occupations = data;
        return this;
    },
};
