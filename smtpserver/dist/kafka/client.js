"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafka = void 0;
const { Kafka } = require('kafkajs');
const ip = process.env.PRIVATE_IP;
exports.kafka = new Kafka({
    clientId: 'mail-server-kafka',
    brokers: [`${ip}:9092`],
});
