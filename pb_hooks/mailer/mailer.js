// Intercept all PocketBase emails and send via HTTP API
onMailerSend((e) => {
    const DEBUG = true;
    // const secrets = require(`${__hooks}/secrets.json`);
    DEBUG && console.log('📧 Intercepting email for HTTP delivery');

    const POSTMARK_SERVER_TOKEN = $os.getenv('POSTMARK_SERVER_TOKEN');

    DEBUG && console.log('POSTMARK_SERVER_TOKEN = ', POSTMARK_SERVER_TOKEN);

    // Extract recipient email
    let recipient = e.message.to;
    if (!recipient) {
        DEBUG && console.error('❌ No recipient found');
        return;
    }

    // Clean recipient email (remove angle brackets if present)
    recipient = String(recipient).replace(/^<|>$/g, '');

    DEBUG && console.log('✅ Sending to:', recipient);

    // Prepare email data (ZeptoMail example)
    const emailData = {
        From: 'Pinback <notification@pinback.io>',
        To: recipient,
        subject: e.message.subject,
        HtmlBody: e.message.html,
        TextBody: e.message.text,
    };

    // Send via HTTP API
    try {
        const response = $http.send({
            url: 'https://api.postmarkapp.com/email',
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
            },
            body: JSON.stringify(emailData),
            timeout: 30,
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            DEBUG && console.log('✅ Email sent successfully via HTTP API');
        } else {
            $app.logger().error(
                '❌ HTTP API error:',
                response.statusCode,
                toString(response.body)
            );
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }

    // Skip PocketBase's SMTP attempt by not calling e.next()
});
