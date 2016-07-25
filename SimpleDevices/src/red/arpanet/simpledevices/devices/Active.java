package red.arpanet.simpledevices.devices;

import static red.arpanet.logging.Log.d;
import static red.arpanet.logging.Log.e;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.log4j.Logger;

public abstract class Active {
	
	private static final Logger LOG = Logger.getLogger(Active.class);
	
	private static final String NASHORN_CLASS = "jdk.nashorn.api.scripting.NashornScriptEngine";
	private static final String NASHORN_COMPAT_SCRIPT = "load(\"nashorn:mozilla_compat.js\");";
	
	protected final ScriptEngine engine;
	protected final Invocable func;
	
	public Active() {
		//create a script engine manager
	    ScriptEngineManager factory = new ScriptEngineManager();
	    // create a JavaScript engine
	    engine = factory.getEngineByName("JavaScript");
	    func = (Invocable)engine;
	    // evaluate JavaScript code from String
	    try {
			engine.eval("print('SCRIPT ENGINE ACTIVATED\\n')");
			
			d(LOG, engine.getClass().getName());
			
			if(engine.getClass().getName().equals(NASHORN_CLASS)) {
				engine.eval(NASHORN_COMPAT_SCRIPT);
			}
						
		} catch (ScriptException e) {
			e(LOG,"Exception starting Javascript engine.",e);
		}
	}
	
	public abstract void poll();
	
}
