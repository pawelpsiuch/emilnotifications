import mjml2html from 'mjml'
import { MJMLParseResults} from 'mjml-core'
import {startCase, camelCase} from 'lodash';
import * as dotenv from 'dotenv'
dotenv.config()

const NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || null

type EmailPayload = {
  to: string | string[]
  cc?: string | string[]
  subject: string
  attachments?: any[]
}

type NodemailerEmail = {
  from?: string
  to: string[]
  cc?: string[]
  subject: string
  html?: string
  attachments?: any[]
}



interface MJMLJsonObject {
    tagName: string;
    attributes: object;
    children?: MJMLJsonObject[];
    content?: string;
}



export class Email {
  mjml?: MJMLParseResults
  html: string
  json: MJMLJsonObject
  message: NodemailerEmail
  transporter: any
  bodyJson: MJMLJsonObject[] = []


  constructor(transporter: any  ,input: EmailPayload ) {
    this.transporter = transporter
    this.message = {
      to: Array.isArray(input.to) ? input.to : input.to?.split(';'),
      cc: Array.isArray(input.cc) ? input.cc : input.cc?.split(';'),
      subject: input.subject,
      attachments: input.attachments || []
    }

    

    if (NODE_ENV !== 'production') {
      if(!DEVELOPER_EMAIL){
        throw 'DEVELOPER_EMAIL not set in .env file'
      }

      this.message.subject = `[${NODE_ENV.toUpperCase()}] ${this.message.subject}`
      this.message.attachments?.push(
        {   
          filename: 'receivers.txt',
          content: JSON.stringify({
            to: this.message.to,
            cc: this.message.cc
          })
        }
      )
      this.message.to = [DEVELOPER_EMAIL];
      this.message.cc = [];
      }

    this.html = ''
    this.json = {
      tagName: 'mjml',
      attributes: {},
      children: []
    }
    this.bodyJson = []
  }

  addLogo(src: string) {
    if(src){
      this.bodyJson.push({
        tagName: 'mj-image',
        attributes: {
          'padding': '0px',
          'width': '80px',
          'src': src
        }
      })
      this.bodyJson.push({
        tagName: 'mj-divider',
        attributes: {
          'border-color': '#E90044'
        }
      })
    }
  }

  addRaw(text: string) {
    let element: MJMLJsonObject = {
      tagName: 'mj-raw',
      attributes: {
        // 'font-size': '16px',
        // 'font-weight': 800
      },
      content: text
    }


    this.bodyJson.push(element)
  }


  addTable(data: object[]) {
    if(data.length){

      let element: MJMLJsonObject = {
        tagName: 'mj-table',
        attributes: {
          'font-size': '20px'
        },
        content: ''
      }
      element.content += `<tr>`
      for (const [key] of Object.entries(data[0]!)) {
        //console.log(key)
        element.content += `<th style="text-align:left">${startCase(camelCase(key))}:</th>`
      }
      element.content += `</tr>`
  
      data.forEach(row => {
        element.content += `<tr>`
        for (const [key, value] of Object.entries(row)) {
          //console.log(`${key} ${value}`)
          element.content += `<td>${value}</td>`
        }
        element.content += `</tr>`
      });
      this.bodyJson.push(element)
    }
    
  }

  addTitle(text: string) {
    let element: MJMLJsonObject = {
      tagName: 'mj-text',
      attributes: {
        'font-size': '16px',
        'font-weight': 800
      },
      content: text
    }

    this.bodyJson.push(element)
  }

  addDivider() {
    let element: MJMLJsonObject = {
      tagName: 'mj-divider',
      attributes: {
        'border-width': "1px",
        'border-style': "dashed",
        'border-color': "lightgrey",
        'padding': "0 20px"
      }
    }

    this.bodyJson.push(element)
  }

  addObjectList(listData: object) {
    let element: MJMLJsonObject = {
      tagName: 'mj-table',
      attributes: {
        width: '',
        cellpadding: '10px'
      },
      content: ''
    }

    for (const [key, value] of Object.entries(listData)) {
      //console.log(`${key}: ${value}`);
      element.content += `<tr>
                <th style="text-align:left">${startCase(camelCase(key))}:</th>
                <td style="padding-left: 5px;">${value}</td>
            </tr>`
    }

    this.bodyJson.push(element)
  }

  addWarningList(warnings: string[]) {
    let element: MJMLJsonObject = {
      tagName: 'mj-text',
      attributes: {
        'color': 'orange'
      },
      content: '<ul>'
    }

    warnings.forEach(row => {

      //console.log(`${key}: ${value}`);
      element.content += `
                <li>${row}</li>
            `
    })

    element.content += `</ul>`

    this.bodyJson.push(element)
  }

  addErrorList(errors: string[]) {
    let element: MJMLJsonObject = {
      tagName: 'mj-text',
      attributes: {
        'color': 'red'
      },
      content: '<ul>'
    }

    errors.forEach(row => {

      //console.log(`${key}: ${value}`);
      element.content += `
                <li>${row}</li>
            `
    })

    element.content += `</ul>`

    this.bodyJson.push(element)
  }

  addList(errors: string[]) {
    let element: MJMLJsonObject = {
      tagName: 'mj-text',
      attributes: {
      },
      content: '<ul>'
    }

    errors.forEach(row => {

      //console.log(`${key}: ${value}`);
      element.content += `
                <li>${row}</li>
            `
    })

    element.content += `</ul>`

    this.bodyJson.push(element)
  }

  generate() {
    
    this.mjml = mjml2html(this.json)
    this.html = this.mjml.html
    //console.log(this.mjml.errors)
  }

  async send() {
    this.json.children?.push({
      tagName: 'mj-body',
      attributes: {
        'width': '1000px',

      },
      children: [{
        tagName: 'mj-section',
        attributes: {
          'padding': 0,
        },
        children: [{
          tagName: 'mj-column',
          attributes: {

            'padding': 0
          },
          children: this.bodyJson
        }]
      }]
    })
    this.generate()
    this.message.html = this.html
   

    return  this.transporter.sendMail(this.message)
  }

}
