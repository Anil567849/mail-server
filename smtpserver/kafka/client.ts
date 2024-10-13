const { Kafka } = require('kafkajs')

const ip = process.env.PRIVATE_IP;

export const kafka = new Kafka({
  clientId: 'mail-server-kafka',
  brokers: [`${ip}:9092`],
})