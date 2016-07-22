//Basic device script
importPackage(Packages.red.arpanet.cputest);
importClass(Packages.red.arpanet.cputest.BusMessage);

function enable(var busMsg) {
	if(busMsg === null) {
		return false;
	}
	
	return busMsg.getAddress() == enableAddress;
}