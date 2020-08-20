{
	init: function(elevators, floors) {
		var elevator = elevators[0]; // Let's use the first elevator
		elevator.goingUpIndicator(true);
		elevator.goingDownIndicator(false);

		elevator.on("floor_button_pressed", function(floorNum) {
			elevator.goToFloor(floorNum);
		});

		elevator.on("passing_floor", function(floorNum, direction) {
			// Stop at the floor if the number is pressed
			const pressedFloors = elevator.getPressedFloors();
			if (pressedFloors.includes(floorNum)) {
				moveToFrontOfQueue(floorNum);
			}

			// Pick up passengers if elevator can fit them
			if (
				elevator.loadFactor() < 1
				&& (floors[floorNum].buttonStates.up && direction === 'up')
				|| (floors[floorNum].buttonStates.down && direction === 'down')
			) {
				console.log('stopping to pick up')
				moveToFrontOfQueue(floorNum);
			}
		});

		floors.forEach(floor => {
			floor.on("up_button_pressed", function() {
				elevator.goToFloor(floor.level);
			});
			floor.on("down_button_pressed", function() {
				elevator.goToFloor(floor.level);
			});
		})

		elevator.on("stopped_at_floor", function(floorNum) {
			// Remove future stops at this floor from the queue
			let placeInQueue = -2;
			while (placeInQueue !== -1) {
				placeInQueue = elevator.destinationQueue.findIndex((queuedDestination) => {
					return queuedDestination === floorNum;
				});
				if (placeInQueue !== -1) {
					elevator.destinationQueue.splice(placeInQueue, 1);
				}
			}
			elevator.checkDestinationQueue();

			if (elevator.destinationQueue.length) {
				
				// Is elevator going up?
				if (elevator.goingUpIndicator()) {
					const pressedFloors = elevator.getPressedFloors();
					if (pressedFloors.length) { 
						// Prioritize maintaining same direction
						const sameDirectionFloor = pressedFloors.find(prsFloorNum => prsFloorNum > floorNum);
						if (sameDirectionFloor) moveToFrontOfQueue(sameDirectionFloor);
					} else { // Continue in same direction if there are people waiting
						const floorsWithPeopleWaiting = floors.filter(floor => {
							return floor.floorNum() > floorNum && floor.buttonStates.up;
						}).sort((a, b) => a.floorNum() - b.floorNum());
						if (floorsWithPeopleWaiting.length) {
							moveToFrontOfQueue(floorsWithPeopleWaiting[0].floorNum());
						}
					}
				}

				// Is elevator going down?
				if (elevator.goingDownIndicator()) {
					const pressedFloors = elevator.getPressedFloors();
					if (pressedFloors.length) {
						// Prioritize maintaining same direction
						const sameDirectionFloor = pressedFloors.find(prsFloorNum => prsFloorNum < floorNum);
						if (sameDirectionFloor) moveToFrontOfQueue(sameDirectionFloor);
					} else { // Continue in same direction if there are people waiting
						const floorsWithPeopleWaiting = floors.filter(floor => {
							return floor.floorNum() < floorNum && floor.buttonStates.down;
						}).sort((a, b) => b.floorNum() - a.floorNum());

						if (floorsWithPeopleWaiting.length) {
							moveToFrontOfQueue(floorsWithPeopleWaiting[0].floorNum())
						}
					}
				}
				let nextFloor = elevator.destinationQueue[0];

				elevator.goingUpIndicator(nextFloor > floorNum);
				elevator.goingDownIndicator(nextFloor < floorNum);

			} else if (floors[floorNum].buttonStates.down && !floors[floorNum].buttonStates.up) {
				elevator.goingUpIndicator(false);
				elevator.goingDownIndicator(true);
			} else {
				elevator.goingUpIndicator(true);
				elevator.goingDownIndicator(false);
			}
		});

		const moveToFrontOfQueue = (floorNum) => {
			let placeInQueue = -2;
			while (placeInQueue !== -1) {
				placeInQueue = elevator.destinationQueue.findIndex((queuedDestination) => {
					return queuedDestination === floorNum;
				});
				if (placeInQueue !== -1) {
					elevator.destinationQueue.splice(placeInQueue, 1);
				}
			}
			elevator.destinationQueue.unshift(floorNum);
			elevator.checkDestinationQueue();
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}