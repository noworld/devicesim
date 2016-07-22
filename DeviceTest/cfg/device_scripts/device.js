//Basic device script
importPackage(Packages.red.arpanet.cputest);
importClass(Packages.red.arpanet.cputest.BusMessage);

var x;

function init() {
	return true();
}

function poll() {
	return new BusMessage();
}

function run(busMsg) {
	return true;
}

function flashChip(data) {
	
}