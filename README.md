# bluetooth-configurator

Configures bluetooth serial modules quickly from the command line.

## Installation

A simple install from npm should do the job.

```
git clone https://github.com/ajfisher/bluetooth-configurator.git
cd bluetooth-configurator
npm install
```

## Wire up your Bluetooth module.

You'll need a USB to serial converter to talk to the HC-06 module. Wire
power & ground to the module an TX->RX between the module and the serial converter.

## Usage

Pass in the port, bt module name and pin number you want.

```
bt-config /dev/tty.usbserial01 testname 1234
```

Would use the BT module on port `/dev/tty.usbserial01` and give it the name
`testname` and the pin `1234`

If everything worked you should now be able to look for the bluetooth module
from your bluetooth on your computer.

## TODO:

* Auto Baud detection
* Different baud rates detected
* Default pins
* better error handling
* Make serial instructions cleaner
