package red.arpanet.cputest;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.log4j.Logger;

import static red.arpanet.logging.Log.d;
import static red.arpanet.logging.Log.e;

public abstract class Active {
	
	private static final Logger LOG = Logger.getLogger(Active.class);
	
	protected final ScriptEngine engine;
	
	public Active() {
		//create a script engine manager
	    ScriptEngineManager factory = new ScriptEngineManager();
	    // create a JavaScript engine
	    engine = factory.getEngineByName("JavaScript");
	    // evaluate JavaScript code from String
	    try {
			engine.eval("print('SCRIPT ENGINE ACTIVATED\\n')");
			engine.eval("importPackage(Packages.red.arpanet.cputest);");
			engine.eval("importClass(Packages.red.arpanet.cputest.BusMessage);");
			d(LOG, engine.getClass().getName());
		} catch (ScriptException e) {
			e(LOG,"Exception starting Javascript engine.",e);
		}
	}
	
	public abstract BusMessage poll();
	
}
