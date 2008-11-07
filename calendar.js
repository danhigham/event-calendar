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

  var startDate = intStartDate - ((monthStartDate.getDay() - 1)*86400000);
	var endDate = intEndDate + ((7 - monthEndDate.getDay()) * 86400000);
 
  var mainNode = document.createElement("div");
  mainNode.id = "calendar";
  
  var calendarList = document.createElement("ul");
  calendarList.className = "daylist";
  
  for(var x = startDate; x<=endDate; x+=86400000){
    var dayNode = document.createElement("li")
    var dayDate = new Date(x);
    dayNode.innerHTML = dayDate.getDate();
    
    if ((dayDate.getMonth() + 1) != parseInt(month)) dayNode.className = "off-month";
    
    
    calendarList.appendChild(dayNode);
  }
  
  mainNode.appendChild(calendarList);
  document.body.appendChild(mainNode);
}

