const nodemailer = require('nodemailer')
const {Email} = require('@pawelpsiuch/emilnotifications')
require('dotenv').config()

const  nodemailerTransporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_PASSWORD,
      pass: process.env.SMTP_PASSWORD,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
    }
  },{
    from:  process.env.SMTP_FROM,
      to:  process.env.SMTP_DEVELOPER_EMAIL,
      html: 'test'
  });


const email = new Email(nodemailerTransporter, {})
email.send({})