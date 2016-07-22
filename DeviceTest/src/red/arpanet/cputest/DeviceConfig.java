package red.arpanet.cputest;

public class DeviceConfig {

	protected String name;
	protected String enableScript;
	protected String runSript;
	protected int enableAddress = -1;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEnableScript() {
		return enableScript;
	}

	public void setEnableScript(String enableScript) {
		this.enableScript = enableScript;
	}

	public String getRunSript() {
		return runSript;
	}

	public void setRunSript(String runSript) {
		this.runSript = runSript;
	}

	public int getEnableAddress() {
		return enableAddress;
	}

	public void setEnableAddress(int enableAddress) {
		this.enableAddress = enableAddress;
	}

}
