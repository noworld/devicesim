package red.arpanet.simpledevices.devices;

public enum DeviceScriptValues {
	THIS_DEVICE("thisDevice"),
	ENABLE_ADDRESS("enableAddress"),
	ADDRESS_SIZE("addressSize"),
	DESC("desc"),
	INIT("init"),
	ENABLE("enable"),
	POLL("poll"),
	RUN("run"),
	FLASH_CHIP("flashChip"),
	VERIFY_FLASH("verifyFlash");
	
	private String name;
	
	private DeviceScriptValues(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
}
