const { kafka } = require("./client");

async function init() {
  const admin = kafka.admin();
  admin.connect();
  await admin.createTopics({
    topics: [
      {
        topic: "emails",
        numPartitions: 1,
      },
    ],
  });
  await admin.disconnect();
}

init();