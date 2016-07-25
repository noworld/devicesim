package red.arpanet.simpledevices.devices;

import static red.arpanet.logging.Log.d;
import static red.arpanet.logging.Log.e;
import static red.arpanet.logging.Log.w;
import static red.arpanet.simpledevices.devices.DeviceScriptValues.INIT;
import static red.arpanet.simpledevices.devices.DeviceScriptValues.POLL;
import static red.arpanet.simpledevices.devices.DeviceScriptValues.THIS_DEVICE;

import java.io.IOException;
import java.nio.charset.Charset;

import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

public class Device extends Active {
	
	private static final Logger LOG = Logger.getLogger(Device.class);
	private static final Object[] EMPTY_ARGS = new Object[]{};
	private static final Charset CHAR_SET = Charset.defaultCharset();
	
	protected String[] scripts;

	public Device(DeviceConfig config) {
		super();
		this.name = config.getName();
		this.scripts = config.getScripts();
		initActive();
	}
	
	@Override
	public void poll() {
		d(LOG,String.format("Device %s polling!", name));

		try {						
			func.invokeFunction(POLL.getName(), EMPTY_ARGS);
		} catch (ScriptException | NoSuchMethodException e) {
			e(LOG,String.format("Exception polling device %s!", this.name),e);
		}

	}

	protected void initActive() {
		//Set a property on the engine
		//for accessing this java object
		engine.put(THIS_DEVICE.getName(), this);

		//Check to make sure there are scripts available
		if(this.scripts != null && this.scripts.length > 0) {
			//Load each script in order
			for(int i = 0; i < this.scripts.length; i++) {
				try {
					//If the script is populated, then run it
					if(StringUtils.isNotBlank(this.scripts[i])) {
						//Eval the script
						String tempScript = IOUtils.toString(Device.class.getResourceAsStream(this.scripts[i]), CHAR_SET);
						engine.eval(tempScript);
					}
				} catch (IOException | ScriptException e) {
					e(LOG,String.format("Exception loading device script: %s, script: %s", this.name, this.scripts[i]),e);
				}
			}
			
			//Invoke the initialization function
			try {
				if(!(Boolean)func.invokeFunction(INIT.getName(), EMPTY_ARGS)) {
					w(LOG,String.format("Problem initializing device: %s", this.name));
				}
			} catch (NoSuchMethodException | ScriptException e) {
				e(LOG,String.format("Exception initializing device: %s", this.name),e);
			}
		}
	}

}
