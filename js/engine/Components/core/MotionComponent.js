export default (function(Component) {

	// CLASS MotionComponent
	MotionComponent.prototype = Object.create(Component.prototype);
	MotionComponent.prototype.constructor = MotionComponent;
	function MotionComponent() {
		// inherits from
		Component.call(this);
		// private variables

		// private methods
		
		// configure component

	};

	MotionComponent.prototype.EVENTS = {
		onmove: MotionComponent.name + ':onmove',
		onvelocitychange: MotionComponent.name + ':onvelocitychange',
		onaccelerationchange: MotionComponent.name + ':onaccelerationchange'
	};

    return MotionComponent;
	
});