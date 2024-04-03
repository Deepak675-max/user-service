const amqplib = require("amqplib");
const ProductService = require("../../services/product/product.service");
const { CART_QUEUE, ORDER_QUEUE, PRODUCT_QUEUE } = require("../../config/index");

const connectToMessageBroker = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(PRODUCT_QUEUE);
    return { channel, connection };
}

const consumeMessage = (channel) => {
    channel.consume(PRODUCT_QUEUE, async (msg) => {
        const payload = JSON.parse(msg.content.toString());
        const productServiceInstance = new ProductService();
        // Retrieve data based on event
        const serviceResponse = await productServiceInstance.SubscribeEvents(payload);
        // Send service response
        if (serviceResponse) {
            if (payload.service == "Order")
                channel.sendToQueue(ORDER_QUEUE, Buffer.from(JSON.stringify(serviceResponse)));
            if (payload.service == "Cart")
                channel.sendToQueue(CART_QUEUE, Buffer.from(JSON.stringify(serviceResponse)));
        }
    }, { noAck: true });
}

module.exports = {
    connectToMessageBroker,
    consumeMessage
};