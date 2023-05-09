const nodemailer = require('nodemailer')
const { Email } = require('../dist/index')
require('dotenv').config()

const  nodemailerTransporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
    }
  },{
    from:  process.env.SMTP_FROM,
    to:  process.env.DEVELOPER_EMAIL,
    html: 'test'
  });


const email = new Email(nodemailerTransporter, {
  subject: 'test subject',
  to: process.env.DEVELOPER_EMAIL
})
email.addList([
  'testOne'
])
email.addObjectList(
  {
    testOne: 'test one',
    TestTwo: 'test two',
    test_three: 'test three',
    Test_Four: 'test four'
  }
)
email.addTable(
  [
    {
      testOne: 'test one',
      TestTwo: 'test two',
      test_three: 'test three',
      Test_Four: 'test four'
    },
    {
      testOne: 'test one',
      TestTwo: 'test two',
      test_three: 'test three',
      Test_Four: 'test four'
    },
  ])
email.send({})