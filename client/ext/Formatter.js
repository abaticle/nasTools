var Formatter = {


    //Formater for displaying next day button
    nextDay: function(date) {
        if (date === 0) {
            return false;
        }
        return true;
    },

    //Formatter for displaying toolbar text
    currentDay: function(currentDay) {
        if (currentDay === 0) {
            return "Aujourd'hui";
        } else if (currentDay === 1) {
            return "Hiers";
        } else {
            //return "avant.. todo !!!!!!";
            var date = new Date();
            date.setDate(date.getDate() - currentDay);


            var dateString = [
                date.getDate(),
                date.getMonth(),
                date.getYear()
            ].join("/");

            return "Le " + dateString;
        }

    },

    //Formatter for button type when file is copied or not
    buttonType: function(isCopied) {
        if (isCopied)
            return undefined;
        return "Reject";
    },

    buttonEnabled: function(isCopied) {
        if (isCopied)
            return false;
        return true;
    }

}
