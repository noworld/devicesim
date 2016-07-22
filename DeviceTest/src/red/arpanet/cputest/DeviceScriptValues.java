package red.arpanet.cputest;

public enum DeviceScriptValues {
	THIS_DEVICE("thisDevice"),
	ENABLE_ADDRESS("enableAddress"),
	INIT("init"),
	ENABLE("enable"),
	POLL("poll"),
	RUN("run");
	
	private String name;
	
	private DeviceScriptValues(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
}
