package red.arpanet.cputest;

public class FlashData {

	protected boolean display = false;
	protected String[] data;
	
	public FlashData() {
		
	}
	
	public FlashData(String[] data) {
		this.data = data;
	}

	public String[] getData() {
		return data;
	}

	public void setData(String[] data) {
		this.data = data;
	}

	public boolean getDisplay() {
		return display;
	}

	public void setDisplay(boolean display) {
		this.display = display;
	}
	
}
