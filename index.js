
'use strict';
var Service, Characteristic;
var mqtt = require("mqtt");

function WS2812MQTTEffectsAccessory(log, config) {
  	this.log          	= log;
  	this.name 			= config["name"];
  	this.url 			= config["mqttUrl"];
  	this.topic 			= config["topic"];
  	this.effectNumber	= config["effectNumber"];
	this.client_Id 		= 'mqttjs_' + Math.random().toString(16).substr(2, 8);
	this.options = {
	keepalive: 10,
   	clientId: this.client_Id,
    protocolId: 'MQTT',
   	protocolVersion: 4,
   	clean: true,
   	reconnectPeriod: 1000,
   	connectTimeout: 30 * 1000,
	will: {
		topic: 'WillMsg',
		payload: 'Connection Closed abnormally..!',
		qos: 0,
		retain: false
	},
    username: config["username"],
    password: config["password"],
   	rejectUnauthorized: false
	};
	this.on = false;
	this.service = new Service.Switch(this.name);
  	this.service
    	.getCharacteristic(Characteristic.On)
    	.on('get', this.getStatus.bind(this))
    	.on('set', this.setStatus.bind(this));
   
	this.client = mqtt.connect(this.url, this.options);
	var that = this;
	this.client.on('error', function (err) {
		that.log('Error event on MQTT:', err);
	});

	this.client.on('message', function (topic, message) {
		

	});
    this.client.subscribe(this.topic);
  
}

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;

  	homebridge.registerAccessory("homebridge-ws2812-mqtt-effects", "WS2812MQTTEffectsAccessory", WS2812MQTTEffectsAccessory);
}

WS2812MQTTEffectsAccessory.prototype.getStatus = function(callback) {
    callback(null, false);
}

WS2812MQTTEffectsAccessory.prototype.setStatus = function(state, callback, context) {
	if(state == true) {
		this.client.publish(this.topic, 'r0,0,0');
	    this.client.publish(this.topic, this.effectNumber);
	} else {
		this.client.publish(this.topic, "e0");
	}
	callback();
}

WS2812MQTTEffectsAccessory.prototype.getServices = function() {
	var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "RGB Led Strip")
        .setCharacteristic(Characteristic.Model, "WS2812 RGB Led")
        .setCharacteristic(Characteristic.SerialNumber, "WS2812B " + this.name);

  return [informationService, this.service];
}