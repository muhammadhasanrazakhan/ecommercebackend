const sendWhatsappAlert = async (message) => {
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    try {
        const sentMessage = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+923104725572'
        });
        console.log(sentMessage.sid);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }    
}

module.exports = sendWhatsappAlert;