var program = require("commander");
var SerialPort = require("serialport");

var sp = null;
var error = false;
var state = "SETUP";
var response_buffer = "";

var bt_name, bt_pin;

var testConnection = function() {
    return new Promise(function(ok, err) {
        console.log("Testing the connection");
        sp.write("AT", function(err) {
            if (err) {
                error = true;
                throw (err);
            }
            state = "TEST_CONNECT_RESPONSE";

            sp.drain(function(){
                ok();
            });
        });
    })
};

var setName = function(name) {
    return new Promise(function(ok, err) {
        console.log("Setting the name");
        sp.write("AT+NAME" + name, function(err) {
            if (err) {
                error = true;
                throw(err);
            }
            state = "SET_NAME_RESPONSE";

            sp.drain(function() {
                ok();
            });
        });
    });
};

var setPin = function(pin) {
    return new Promise(function(ok, err) {
        console.log("Setting the pin");
        sp.write("AT+PIN" + pin, function(err) {
            if (err) {
                error = true;
                throw(err);
            }
            state = "SET_PIN_RESPONSE";

            sp.drain(function() {
                ok();
            });
        });
    });
};

var setBaud = function() {
    return new Promise(function(ok, err) {
        console.log("Setting the Baudrate to 57600");
        sp.write("AT+BAUD7", function(err) {
            if (err) {
                error = true;
                throw(err);
            }

            state = "SET_BAUD_RESPONSE";

            sp.drain(function() {
                ok();
            });
        });
    });
};

var closeConnection = function(err) {

    if(err) {
        console.log("An error occurred: ", err);
    };

    sp.close(function(err) {
        if (err) {
            console.log("Error closing port: ", err);
            process.exit(1);
        }

        if (! error) {
            console.log("You should now be able to connect with bluetooth" +
                    " and see a module named %s which you can connect to" +
                    " using PIN <%s>", bt_name, bt_pin);
            process.exit(0);
        }
    });
};


function configure(port, module_name, pin) {
    // does the writing of the module.

    bt_name = module_name;
    bt_pin = pin;

    console.log("Opening serial port: %s", port);
    sp = new SerialPort(port, {
        baudRate: 9600,
    });

    sp.on('open', function(err) {
        console.log("Serialport open");

        testConnection()
            .catch(function(err) {
                console.log("error of some sort", err);
                closeConnection(err);
            });
    });

    sp.on('error', function(err) {
        console.log("error opening port %s", err);
    });

    sp.on('data', function(data) {
        response_buffer += data.toString();

        switch (state) {
            case "TEST_CONNECT_RESPONSE":
                if (response_buffer == "OK") {
                    console.log("Connection returned OK");
                    response_buffer = "";
                    setName(bt_name)
                        .catch(function(err) {
                            console.log("error of some sort", err);
                            closeConnection(err);
                        });
                }
                break;

            case "SET_NAME_RESPONSE":
                if (response_buffer == "OKsetname") {
                    console.log("Set the name correctly");
                    response_buffer = "";
                    setPin(bt_pin)
                        .catch(function(err) {
                            console.log("error of some sort", err);
                            closeConnection(err);
                        });
                }
                break;

            case "SET_PIN_RESPONSE":
                if (response_buffer == "OKsetPIN") {
                    console.log("Set the pin correctly");
                    response_buffer = "";
                    setBaud()
                        .catch(function(err) {
                            console.log("error of some sort", err);
                            closeConnection(err);
                        });
                }
                break;
            case "SET_BAUD_RESPONSE":
                if (response_buffer == "OK57600") {
                    console.log("Set the baudrate");
                    closeConnection();
                }
                break;
        }
    });
}


program
    .version("0.0.1")
    .usage("<port> <name> <pin>")
    .description("Configure a BT serial module")
    .action(function(port, module_name, pin) {
        if (typeof(port) != "string" || typeof(module_name) != "string" || typeof(pin) != "string") {
            program.help();
        } else {
            configure(port, module_name, pin);
        }
    });

program.parse(process.argv);






