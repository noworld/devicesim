package red.arpanet.cputest;

public class DeviceConfig {

	protected String name;
	protected String[] scripts;
	protected int enableAddress = -1;
	protected int addressSize = 1;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String[] getScripts() {
		return scripts;
	}

	public void setScripts(String[] scripts) {
		this.scripts = scripts;
	}

	public int getEnableAddress() {
		return enableAddress;
	}

	public void setEnableAddress(int enableAddress) {
		this.enableAddress = enableAddress;
	}

	public int getAddressSize() {
		return addressSize;
	}

	public void setAddressSize(int addressSize) {
		this.addressSize = addressSize;
	}

	

}
