package red.arpanet.cputest;

import static red.arpanet.logging.Log.i;

import java.io.IOException;
import java.nio.charset.Charset;

import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import static red.arpanet.logging.Log.e;

public class Device extends Active {
	
	private static final Logger LOG = Logger.getLogger(Device.class);
	
	private static final String MESSAGE_VARIABLE = "busMsg";
	private static final String ENABLE_RESULT = "enableResult";
	private static final String RUN_RESULT = "runResult";
	private static final String THIS_DEVICE = "thisDevice";

	protected String name;
	protected Bus bus;
	protected String initScript;
	protected String pollScript;
	protected String runScript;
	protected String enableScript;
	protected BusMessage busMsg = null;
	
	public Device(DeviceConfig dc ) throws ScriptException {
		super();
		
		Charset charSet = Charset.defaultCharset();
		
		this.name = dc.name;
		
		try {
			if(StringUtils.isNoneBlank(dc.getRunScript())) {
				this.runScript = IOUtils.toString(Device.class.getResourceAsStream(dc.getRunScript()), charSet);
			}
		} catch (IOException e) {
			e(LOG,String.format("Could not load run script: %s", dc.getRunScript()),e);
		}
		
		try {
			if(StringUtils.isNotBlank(dc.getEnableScript())) {
				this.enableScript = IOUtils.toString(Device.class.getResourceAsStream(dc.getEnableScript()), charSet);
			}
		} catch (IOException e) {
			e(LOG,String.format("Could not load enable script: %s", dc.getEnableScript()),e);
		}
		
		try {
			if(StringUtils.isNotBlank(dc.getPollScript())) {
				this.pollScript = IOUtils.toString(Device.class.getResourceAsStream(dc.getPollScript()), charSet);
			}
		} catch (IOException e) {
			e(LOG,String.format("Could not load poll script: %s", dc.getPollScript()),e);
		}
		
		try {
			if(StringUtils.isNotBlank(dc.getInitScript())) {
				
				this.initScript = IOUtils.toString(Device.class.getResourceAsStream(dc.getInitScript()), charSet);
				
				if(StringUtils.isNotBlank(this.initScript)) {				
					engine.put(THIS_DEVICE, this);
					engine.eval(this.initScript);
				}
			}
		} catch (IOException e) {
			e(LOG,String.format("Could not load init script: %s", dc.getInitScript()),e);
		}
		
		
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Bus getBus() {
		return bus;
	}

	public void setBus(Bus bus) {
		this.bus = bus;
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

	public boolean enableDevice(BusMessage message) {
		
		if(StringUtils.isBlank(enableScript)) {
			return false;
		}
		
		if(message == null) {
			return false;
		}
		
		boolean match = false;
		
		try {		
			engine.put(MESSAGE_VARIABLE, message);
			engine.eval(enableScript);
			match = ((Boolean)engine.get(ENABLE_RESULT)).booleanValue();
		} catch (ScriptException e) {
			e.printStackTrace();
			match = false;
		}
		
		if(match) {
			i(LOG,String.format("Device %s enabled!", name));
		}
		
		return match;
	}
	
	public boolean runDevice(BusMessage message) {
		
		if(StringUtils.isBlank(runScript)) {
			return true;
		}

		boolean success = false;
		
		i(LOG,String.format("Device %s running!", name));
		
		try {		
			engine.put(MESSAGE_VARIABLE, message);
			engine.eval(runScript);
			success = ((Boolean)engine.get(RUN_RESULT)).booleanValue();
		} catch (ScriptException e) {
			e.printStackTrace();
			success = false;
		}
		
		return success;
	}

	public BusMessage poll() {
		
		if(StringUtils.isBlank(pollScript)) {
			return null;
		}
		
		BusMessage busMsg = null;
		
		i(LOG,String.format("Device %s polling!", name));
		
		try {			
			engine.eval(pollScript);
			Object message = engine.get(MESSAGE_VARIABLE);
			busMsg = message == null ? null : (BusMessage)message;
		} catch (ScriptException e) {
			e.printStackTrace();
		}
		
		return busMsg;
	}
	
}
