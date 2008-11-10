function doCal() {
	var myCalendar = new EventCalendar('myCalendar', 11, 2008, {"events_offset" : [0, 0]});
	/*
	myCalendar.SetMonth(11);
	myCalendar.SetYear(2008);
	myCalendar.BuildCalendarMarkup();
	*/
	
	var myEvents = new EventCollection();
	myEvents.Events.push ( new Event ("blah", "2008/11/01", "2008/11/05", "Test event") );
	myEvents.Events.push ( new Event ("blah 2", "2008/11/06", "2008/11/07", "Test event 2") );

	myCalendar.AddEventsInJSON(myEvents.toJSON());

}

var Event = function (name, start, end, description) { 
	return {
		Name : name,
		Start : start,
		End : end,
		Description : description,
		toJSON : function () { return "{ \"name\" : \"" + this.Name + "\", \"start\" : \"" + this.Start + "\", \"end\" : \"" + this.End + "\", \"description\" : \"" + this.Description + "\" }"; }
	}
}

var EventCollection = function (){ 
	return {
		Events : new Array(),
		toJSON : function () {
			var outJSON = "({\"eventcount\" : " + this.Events.length + "," + "\"events\" : [";
			for (var x = 0; x < this.Events.length; x++) {
				if (x > 0) outJSON += ",";
				outJSON += this.Events[x].toJSON();
			}
			outJSON += "] })";
			return (outJSON);
		}
	}	
}

var EventCalendar = function (dom_element, month, year, settings) {
	
	var targetnode = dom_element || null;
	var current_month = month || null;
	var current_year = year || null;
	var calendar_visible = false;
	var calendar_start_date = null;
	var calendar_end_date = null;
	
	var calendar_settings = settings || null;
	
	if ((dom_element) && (month) && (year)) create_base_calendar();
	
	//Private / Internal functions
	
	function create_base_calendar() {
		var intStartDate = Date.parse(current_year + '/' + current_month + '/01')
		calendar_start_date = intStartDate; // Use this later when plotting data
		var monthStartDate = new Date(intStartDate);
		
		//Calculate end date
		var endMonth
		var endYear
		
		if (current_month == 12) {
			endMonth = 1;
			endYear = parseInt(current_year) + 1;
		} else {
			endMonth = parseInt(current_month) + 1;
			endYear = current_year;
		}
		
		var intEndDate = Date.parse(endYear + '/' + endMonth + '/01') - 86400000;
		calendar_end_date = intEndDate; // Used later
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
	    	dayNode.id = "cell_" + (dayDate.getMonth() + 1) + "_" + dayDate.getDate(); 
	    	dayNode.innerHTML = dayDate.getDate();
	    
	    	if ((dayDate.getMonth() + 1) != parseInt(current_month)) dayNode.className = "off-month";
	    
	    	calendarList.appendChild(dayNode);
	  	}
	  
	  	mainNode.appendChild(calendarList);
	  	document.getElementById(targetnode).appendChild(mainNode);
	  	
	  	calendar_visible = true;
	}

	function get_calendar_cell(date){
		var cell_date = new Date(date);
	    return document.getElementById("cell_" + (cell_date.getMonth() + 1) + "_" + cell_date.getDate());
	}

	function plot_data(events){
		// This function plots event data on to the calendar, it takes a parameter in JSON format
		// that holds all the event particulars;
		//
	    //		{"eventcount" : 2,
	    //		"events" : [
	    //			{ "name" : "blah", "start" : "2008/11/01", "end" : "2008/11/04", "description" : "this is an event" },
	    //			{ "name" : "blah", "start" : "2008/11/01", "end" : "2008/11/04", "description" : "this is an event" }
	    //      ] }
	    
	    var event_offset_X = calendar_settings.events_offset[0];
	    var event_offset_Y = calendar_settings.events_offset[1]; 
	    var event_collection = eval( events );
	    
	    for (var x=0; x<event_collection.eventcount; x++){
	    	var new_event = event_collection.events[x];
	    	
	    	var date_cell = get_calendar_cell(new_event.start);
	    	
	    	var eventBlock = document.createElement("div");
	    	eventBlock.style.position = 'absolute';
	    	eventBlock.style.top = (date_cell.offsetTop + event_offset_Y) + 'px';
	    	eventBlock.style.left = (date_cell.offsetLeft + event_offset_X) + 'px';
	    	eventBlock.className = "event";
	    	document.body.appendChild(eventBlock);
	    }
	    
	}
	
	//Public methods	
	return {
		
		BuildCalendarMarkup : function() {
			if ((targetnode) && (current_month) && (current_year)) create_base_calendar();
		},
		SetMonth : function(month) {
			current_month = month;
		},
		SetYear : function(year) {
			current_year = year;
		},
		SetTarget : function(target){
			targetnode = target;
		},
		AddEventsInJSON : function(json_events){
			if (eval(json_events).eventcount > 0) plot_data(json_events);
		}
		
	};
	
}