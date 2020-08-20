{
	init: function(elevators, floors) {
		var elevator = elevators[0]; // Let's use the first elevator

		// Whenever the elevator is idle (has no more queued destinations) ...
		elevator.on("idle", function() {
				// let's go to all the floors (or did we forget one?)
				// elevator.goToFloor(0); 
				elevator.goToFloor(1);

		});
		elevator.on("floor_button_pressed", function(floorNum) {
			elevator.goToFloor(floorNum);
		});
		elevator.on("passing_floor", function(floorNum, direction) {
			console.log(floors[floorNum])
		});
		floors.forEach(floor => {
			floor.on("up_button_pressed", function() {
				elevator.goToFloor(floor.level);
			});
			floor.on("down_button_pressed", function() {
				elevator.goToFloor(floor.level);
			});
		})
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}