package red.arpanet.cputest;

import java.util.HashSet;
import java.util.Set;

public class BusMessage {

	protected Device source;
	protected int address;
	protected String data;
	protected Set<SignalType> activeSignals;
	
	public BusMessage() {
		this.activeSignals = new HashSet<SignalType>();
	}

	public Device getSource() {
		return source;
	}

	public void setSource(Device source) {
		this.source = source;
	}

	public int getAddress() {
		return address;
	}

	public void setAddress(int address) {
		this.address = address;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public Set<SignalType> getActiveSignals() {
		return activeSignals;
	}

	public void setActiveSignals(Set<SignalType> activeSignals) {
		this.activeSignals = activeSignals;
	}

}
