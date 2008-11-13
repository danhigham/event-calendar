function doCal() {
	var myCalendar = new EventCalendar('myCalendar', 11, 2008, 
		{
			"events_offset" : [0, 20],
			"event_info_url" : "info",
			"event_delete_url" : "delete"
		}
	);
	/*
	myCalendar.SetMonth(11);
	myCalendar.SetYear(2008);
	myCalendar.BuildCalendarMarkup();
	*/
	
	var myEvents = new EventCollection();
	myEvents.Events.push ( new Event (1, "blah", "2008/11/01", "2008/11/05", "Test event", "#ff0000") );
	myEvents.Events.push ( new Event (2, "blah 2", "2008/11/05", "2008/11/09", "Test event 2", "#00ff00") );
	myEvents.Events.push ( new Event (3, "blah 2", "2008/11/08", "2008/11/12", "Test event 2", "#0000ff") );
	myEvents.Events.push ( new Event (4, "blah 2", "2008/11/11", "2008/11/13", "Test event 2", "#ff0000") );
	
	myEvents.Events.push ( new Event (5, "blah 2", "2008/10/29", "2008/11/01", "Test event 2", "#00ff00") );
	
	myCalendar.AddEventsInJSON(myEvents.toJSON());

}

var Event = function (id, name, start, end, description, color) { 
	return {
		Id : id,
		Name : name,
		Start : start,
		End : end,
		Description : description,
		Color : color,
		toJSON : function () { return "{ \"id\" : " + this.Id + ", \"name\" : \"" + this.Name + "\", \"start\" : \"" + this.Start + "\", \"end\" : \"" + this.End + "\", \"description\" : \"" + this.Description + "\", \"color\" : \"" + this.Color + "\" }";}
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
	var date_matrix = {};
	
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
	  	$(targetnode).appendChild(mainNode);
	  	
	  	calendar_visible = true;
	}

	function get_calendar_cell(date){
		var cell_date = new Date(date);
	    return $("cell_" + (cell_date.getMonth() + 1) + "_" + cell_date.getDate());
	}

	function dialog_track_mouse(event){
		var dialog = $('event_info_dialog');
		
		dialog.style.top = event.clientY + 10;
		dialog.style.left = event.clientX + 10;	
	}

	function show_event_info(event){
		if (!$('event_info_dialog')) {
			var dialog = document.createElement('div');
			dialog.id = 'event_info_dialog';
			
			document.body.appendChild(dialog);
		}
		
		$('event_info_dialog').style.visibility = 'visible';
		
		Event.observe(event.target.id, 'mouseout', hide_event_info);
		Event.observe(document, 'mousemove', dialog_track_mouse);
	}

	function hide_event_info(event){
		$('event_info_dialog').style.visibility = 'hidden';
		Event.stopObserving(document, 'mousemove', dialog_track_mouse)
	}

	function plot_data(events, cell_matrix){
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
	    
	    for (var e=0; e<event_collection.eventcount; e++){
	    	var new_event = event_collection.events[e];
	    	
	    	var int_date_start = Date.parse(new_event.start)
	    	var int_date_end = Date.parse(new_event.end)
	    	
	    	var start_date_cell = get_calendar_cell(new_event.start);
	    	//var end_date_cell = get_calendar_cell(new_event.end);
	    	
	    	var free_row = 0;
	    	
	    	for(var x = int_date_start; x<=int_date_end; x+=86400000){
	    		var current_date = new Date(x);
	    		var current_cell = get_calendar_cell(current_date);
	    		
				//Check each cell to see if there has been a bar placed at the the current free row, if there is bump it up one...
				if (cell_matrix[current_date]) {
					var cell_bitmask = cell_matrix[current_date];
					if (cell_bitmask[free_row] == "1") free_row ++;	
				} else 
					//Create a blank entry for this date
					cell_matrix[current_date] = ("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0".split(","));
    		}
    		
    		var eventBlock = document.createElement("div");
    		eventBlock.id = 'calendar_event_' + new_event.id;
	    	eventBlock.style.position = 'absolute';
	    	eventBlock.style.top = (start_date_cell.offsetTop + (event_offset_Y * free_row)) + 'px';
	    	eventBlock.style.left = (start_date_cell.offsetLeft + event_offset_X) + 'px';
	    	eventBlock.style.backgroundColor = new_event.color;
	    	eventBlock.className = "event";
	    	var eventBlockCell = start_date_cell;
	    	
	    	var partCount = 1;
	    	
    		// Now we know which row is free across all dates, plot the event
    		for(var x = int_date_start; x<=int_date_end; x+=86400000){
    			var current_date = new Date(x);
	    		date_matrix[current_date][free_row] = "1";
	    		
				if ((current_date.getDay() == 0) && (x != int_date_end)) {
					//Reached the end of the row, plot and re-create block
					var current_cell = get_calendar_cell(current_date);
					
					partCount ++;
					
					eventBlock.style.width = ((current_cell.offsetLeft + current_cell.offsetWidth) - start_date_cell.offsetLeft) + 'px';
					document.body.appendChild(eventBlock);
					
					if (calendar_settings.event_info_url) Event.observe(eventBlock, 'mouseover', show_event_info);
					
					var eventBlock = document.createElement("div");
	    			eventBlock.style.position = 'absolute';
	    			
	    			var nextCell = get_calendar_cell(new Date(x+86400000));
	    			eventBlock.id = 'calendar_event_' + new_event.id + '_part_' + partCount;
	    			eventBlock.style.top = (nextCell.offsetTop + (event_offset_Y * free_row)) + 'px';
	    			eventBlock.style.left = (nextCell.offsetLeft + event_offset_X) + 'px';
			    	eventBlock.style.backgroundColor = new_event.color;
	    			eventBlock.className = "event";
	    			eventBlockCell = nextCell;
				}	
	    	}
	    	
	    	var end_date_cell = get_calendar_cell(new_event.end);

	    	eventBlock.style.width = ((end_date_cell.offsetLeft + end_date_cell.offsetWidth) - eventBlockCell.offsetLeft) + 'px';
	    	document.body.appendChild(eventBlock);
	    	
	    	if (calendar_settings.event_info_url) Event.observe(eventBlock, 'mouseover', show_event_info);
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
			if (eval(json_events).eventcount > 0) plot_data(json_events, date_matrix);
		}
		
	};
	
}