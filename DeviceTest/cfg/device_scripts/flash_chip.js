//Script for flashing a ROM chip
importClass(Packages.red.arpanet.cputest.FlashData);

function flashChip(flashData) {
	
	if(flashData === null || flashData.getData() === null) {
		print("No flash data found.");
		return false;
	}
	
	var data = flashData.getData();
	
	if(data.length > chipSize) {
		print("Data too long: " + data.length + " > " + chipSize + "");
		return false;
	}
	
	print("Flashing ROM chip...");
	for(var i = 0; i < data.length; i++) {
		if(flashData.getDisplay()) {
			print("Flashing location " + i + ": " + data[i] + " -> " + mem[i] + "");
		}
		mem[i] = data[i];
	}
	print("Flash complete!");
	return true;
}

function verifyFlash(flashData) {
	
	print("Verifying flash.");
	
	var data = flashData.getData();
	
	for(var i = 0; i < data.length; i++) {
		
		if(flashData.getDisplay()) {
			print("Comparing location " + i + ": " + data[i] + " <--> " + mem[i] + "");
		}
		
		if(mem[i] != data[i]) {
			print("Memory mismatch at location " + i + "!");
			return false;
		}
	}
	print("OK!");
	print("Verification complete.");
	return true;
}