// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const net = require('net');
const tls = require('tls');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Helper function that sends an SMTP command over a socket (plain or TLS),
 * then waits for a response that starts with the expected code.
 */
function sendCommand(socket, command, expectedCode) {
  return new Promise((resolve, reject) => {
    console.log("Sending command:", command.trim());
    socket.write(command);
    socket.once('data', (data) => {
      const response = data.toString();
      console.log("Server response:", response.trim());
      if (response.startsWith(String(expectedCode))) {
        resolve(response);
      } else {
        reject(new Error(`Expected response code ${expectedCode}, but got: ${response}`));
      }
    });
  });
}

/**
 * Sends an email using raw SMTP commands with STARTTLS upgrade as required for Microsoft 365.
 * This follows the best practices outlined in Microsoft's guide:
 * https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/how-to-set-up-a-multifunction-device-or-application-to-send-email-using-microsoft-365-or-office-365 :contentReference[oaicite:1]{index=1}
 */
function sendSMTPEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    // Connect to Microsoft 365 SMTP server on port 587
    const client = net.createConnection(
      { host: process.env.SMTP_HOST, port: process.env.SMTP_PORT },
      async () => {
        try {
          // Wait for the server's initial greeting (should start with "220")
          await sendCommand(client, '', 220);

          // Introduce ourselves using EHLO
          await sendCommand(client, `EHLO localhost\r\n`, 250);

          // Request to upgrade the connection to TLS
          await sendCommand(client, `STARTTLS\r\n`, 220);

          // Upgrade the existing socket to a TLS connection
          const secureClient = tls.connect({ socket: client, host: process.env.SMTP_HOST }, async () => {
            try {
              // Once TLS is established, send EHLO again over the secure channel
              await sendCommand(secureClient, `EHLO localhost\r\n`, 250);

              // Begin SMTP authentication
              await sendCommand(secureClient, `AUTH LOGIN\r\n`, 334);
              await sendCommand(secureClient, Buffer.from(process.env.SMTP_USER).toString('base64') + '\r\n', 334);
              await sendCommand(secureClient, Buffer.from(process.env.SMTP_PASS).toString('base64') + '\r\n', 235);

              // Specify the sender and recipient
              await sendCommand(secureClient, `MAIL FROM:<${mailOptions.from}>\r\n`, 250);
              await sendCommand(secureClient, `RCPT TO:<${mailOptions.to}>\r\n`, 250);

              // Begin the DATA command
              await sendCommand(secureClient, `DATA\r\n`, 354);

              // Construct the email message (headers and body)
              const message =
`Subject: ${mailOptions.subject}\r\n` +
`From: ${mailOptions.from}\r\n` +
`To: ${mailOptions.to}\r\n` +
`\r\n` +
`${mailOptions.text}\r\n.\r\n`;

              // Send the message data
              await sendCommand(secureClient, message, 250);

              // Terminate the SMTP session
              await sendCommand(secureClient, `QUIT\r\n`, 221);
              secureClient.end();
              resolve();
            } catch (error) {
              secureClient.end();
              reject(error);
            }
          });

          secureClient.on('error', (err) => {
            reject(err);
          });
        } catch (error) {
          client.end();
          reject(error);
        }
      }
    );

    client.on('error', (err) => {
      reject(err);
    });
  });
}

// POST endpoint to receive contact form submissions
app.post('/contact', (req, res) => {
  // Extract fields from the submitted form
  const {
    Name,
    Email,
    Phone,
    'Project Name': ProjectName,
    Idea,
    Budget,
    'Heard About Us': HeardAbout
  } = req.body;

  // Build the email content
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    subject: 'New Contact Form Submission',
    text: `You have received a new submission:

Name: ${Name}
Email: ${Email}
Phone: ${Phone}
Project Name: ${ProjectName}
Idea: ${Idea}
Budget: ${Budget}
Heard About Us: ${HeardAbout}`
  };

  // Send the email using our custom SMTP function
  sendSMTPEmail(mailOptions)
    .then(() => {
      res.send('Thank you for your submission!');
    })
    .catch((err) => {
      console.error('Error sending email:', err);
      res.status(500).send('Error sending email');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
