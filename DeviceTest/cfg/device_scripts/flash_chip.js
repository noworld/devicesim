//Script for flashing a ROM chip
importClass(Packages.red.arpanet.cputest.FlashData);

function flashChip(flashData) {
	
	if(flashData === null || flashData.getData() === null) {
		print("No flash data found.\n");
		return false;
	}
	
//	var data = new Array(flashData.getData());
//	
//	if(!Array.isArray(data)) {
//		print("Flash data was not in array form.\n");
//		print("Flash data is of type: " + typeof(data) + "\n");
//		print("Flash data is: " + data + "\n");
//		return false;
//	}
	
	var data = flashData.getData();
	
	if(data.length > chipSize) {
		print("Data too long: " + data.length + " > " + chipSize + "\n");
		return false;
	}
	
	print("Flashing ROM chip...\n");
	for(var i = 0; i < data.length; i++) {
		if(flashData.getDisplay()) {
			print("Flashing location " + i + ": " + data[i] + " -> " + mem[i] + "\n");
		}
		mem[i] = data[i];
	}
	print("Flash complete!\n");
	return true;
}

function verifyFlash(flashData) {
	
	print("Verifying flash.\n");
	
	var data = flashData.getData();
	
	for(var i = 0; i < data.length; i++) {
		
		if(flashData.getDisplay()) {
			print("Comparing location " + i + ": " + data[i] + " <--> " + mem[i] + "\n");
		}
		
		if(mem[i] != data[i]) {
			print("Memory mismatch at location " + i + "!\n");
			return false;
		}
	}
	print("OK!\n");
	print("Verification complete.\n");
	return true;
}