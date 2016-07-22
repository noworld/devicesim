package red.arpanet.cputest;

public class DeviceConfig {

	protected String name;
	protected String initScript;
	protected String runScript;
	protected String enableScript;
	protected String pollScript;

	public String getInitScript() {
		return initScript;
	}

	public void setInitScript(String initScript) {
		this.initScript = initScript;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getRunScript() {
		return runScript;
	}

	public void setRunScript(String script) {
		this.runScript = script;
	}

	public String getEnableScript() {
		return enableScript;
	}

	public void setEnableScript(String enableScript) {
		this.enableScript = enableScript;
	}

	public String getPollScript() {
		return pollScript;
	}

	public void setPollScript(String pollScript) {
		this.pollScript = pollScript;
	}

}
