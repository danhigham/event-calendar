function generateCalMarkup(month, year) {
    
	var intStartDate = Date.parse(year + '/' + month + '/01')
	var monthStartDate = new Date(intStartDate);
	
	//Calculate end date
	var endMonth
	var endYear
	
	if (month == 12) {
		endMonth = 1;
		endYear = parseInt(year) + 1;
	} else {
		endMonth = parseInt(month) + 1;
		endYear = year;
	}
	
	var intEndDate = Date.parse(endYear + '/' + endMonth + '/01') - 86400000;
	var monthEndDate = new Date(intEndDate) 

    var startDate = intStartDate - (monthStartDate.getDay()*86400000);
	var endDate = intEndDate + ((6 - monthEndDate.getDay()) * 86400000);
 
	alert(new Date(startDate));
	alert(new Date(endDate));


}

