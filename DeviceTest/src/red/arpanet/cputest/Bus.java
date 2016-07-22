package red.arpanet.cputest;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class Bus implements Runnable  {
	
	protected List<Device> devices;
	protected String runScript;
	protected Device master;
	protected Long speed;
	protected boolean running = false;
	
	public Bus(BusConfig config) {
		
		this.devices = new ArrayList<Device>();
		this.speed = config.getSpeed();
	}
	
	public Long getSpeed() {
		return speed;
	}

	public void setSpeed(Long speed) {
		this.speed = speed;
	}
	
	public boolean addDevice(Device d) {
		d.setBus(this);
		return devices.add(d);
	}
	
	public void addDeviceAt(int i, Device d) {
		devices.add(i, d);
	}
	
	public boolean removeDevice(Device d) {
		return devices.remove(d);
	}

	public void run() {
		
		//TODO: Break this logic out into a RunStrategy script?
		Long lastTime = (new Date()).getTime();
		Long currentTime = (new Date()).getTime();
		Queue<BusMessage> msgq = new LinkedList<BusMessage>();
		
		master = devices.get(0);
		
		running = true;
		
		while(running) {
			
			if((lastTime + speed) < currentTime) {
				
				//Let the bus master prime the queue
				msgq.add(master.poll());
			
				//Loop from the master back around
				for(int i = getStartDeviceIndex(); i != devices.indexOf(master); i = getNextDeviceIndex(i)) {
					
					Device d = devices.get(i);
					
					//Every device gets a poll
					BusMessage nextMsg = d.poll();
					
					//TODO: If we get a bus master request (DMA)
					//then set the device to the next bus master
					
					//TODO: If we get an interrupt request (IRQ),
					//then interrupt
					
					//Add the message to the queue
					if(nextMsg != null) {
						msgq.add(nextMsg);
					}

					//If we have a message
					//See if it is meant for the current device
					if(!msgq.isEmpty() && d.enableDevice(msgq.peek())) {
						//If it is, then send the message to the device
						d.runDevice(msgq.poll());
					}

				}
				
				//See if any of the messages were responses to the master
				while(!msgq.isEmpty()) {
					//Get the next message
					BusMessage msg = msgq.poll();
					
					//If it is for the master
					if(master.enableDevice(msg)) {						
						//Give it to the master
						master.runDevice(msg);						
					}
				}
				
				lastTime = currentTime;
			}
			
			currentTime = (new Date()).getTime();
		}
			
	}

	//Get the starting device for the loop
	//This is master + 1, but loop around
	//to the start of the device list
	private int getStartDeviceIndex() {
		return getNextDeviceIndex(devices.indexOf(master));		
	}
	
	//Get the next device in the list,
	//accounting for looping around
	private int getNextDeviceIndex(int index) {
		
		if(index >= devices.size() - 1) {
			index = 0;
		} else {
			index++;
		}
		
		return index;
	}

	public void stop() {
		running = false;
	}

}
