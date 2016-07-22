//Basic device script
importClass(Packages.red.arpanet.cputest.BusMessage);

function enable(busMsg) {
	if(busMsg === null) {
		return false;
	}
	
	return busMsg.getAddress() >= enableAddress
			&& busMsg.getAddress() <= (enableAddress + addressSize - 1);
}