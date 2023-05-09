"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const mjml_1 = __importDefault(require("mjml"));
const lodash_1 = require("lodash");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || null;
class Email {
    constructor(transporter, input) {
        var _a, _b, _c;
        this.bodyJson = [];
        this.transporter = transporter;
        this.message = {
            to: Array.isArray(input.to) ? input.to : (_a = input.to) === null || _a === void 0 ? void 0 : _a.split(';'),
            cc: Array.isArray(input.cc) ? input.cc : (_b = input.cc) === null || _b === void 0 ? void 0 : _b.split(';'),
            subject: input.subject,
            attachments: input.attachments || []
        };
        if (NODE_ENV !== 'production') {
            if (!DEVELOPER_EMAIL) {
                throw 'DEVELOPER_EMAIL not set in .env file';
            }
            this.message.subject = `[${NODE_ENV.toUpperCase()}] ${this.message.subject}`;
            (_c = this.message.attachments) === null || _c === void 0 ? void 0 : _c.push({
                filename: 'receivers.txt',
                content: JSON.stringify({
                    to: this.message.to,
                    cc: this.message.cc
                })
            });
            this.message.to = [DEVELOPER_EMAIL];
            this.message.cc = [];
        }
        this.html = '';
        this.json = {
            tagName: 'mjml',
            attributes: {},
            children: []
        };
        this.bodyJson = [];
    }
    addLogo(src) {
        if (src) {
            this.bodyJson.push({
                tagName: 'mj-image',
                attributes: {
                    'padding': '0px',
                    'width': '80px',
                    'src': src
                }
            });
            this.bodyJson.push({
                tagName: 'mj-divider',
                attributes: {
                    'border-color': '#E90044'
                }
            });
        }
    }
    addRaw(text) {
        let element = {
            tagName: 'mj-raw',
            attributes: {
            // 'font-size': '16px',
            // 'font-weight': 800
            },
            content: text
        };
        this.bodyJson.push(element);
    }
    addTable(data) {
        if (data.length) {
            let element = {
                tagName: 'mj-table',
                attributes: {
                    'font-size': '20px'
                },
                content: ''
            };
            element.content += `<tr>`;
            for (const [key] of Object.entries(data[0])) {
                //console.log(key)
                element.content += `<th style="text-align:left">${(0, lodash_1.startCase)((0, lodash_1.camelCase)(key))}:</th>`;
            }
            element.content += `</tr>`;
            data.forEach(row => {
                element.content += `<tr>`;
                for (const [key, value] of Object.entries(row)) {
                    //console.log(`${key} ${value}`)
                    element.content += `<td>${value}</td>`;
                }
                element.content += `</tr>`;
            });
            this.bodyJson.push(element);
        }
    }
    addTitle(text) {
        let element = {
            tagName: 'mj-text',
            attributes: {
                'font-size': '16px',
                'font-weight': 800
            },
            content: text
        };
        this.bodyJson.push(element);
    }
    addDivider() {
        let element = {
            tagName: 'mj-divider',
            attributes: {
                'border-width': "1px",
                'border-style': "dashed",
                'border-color': "lightgrey",
                'padding': "0 20px"
            }
        };
        this.bodyJson.push(element);
    }
    addObjectList(listData) {
        let element = {
            tagName: 'mj-table',
            attributes: {
                width: '',
                cellpadding: '10px'
            },
            content: ''
        };
        for (const [key, value] of Object.entries(listData)) {
            //console.log(`${key}: ${value}`);
            element.content += `<tr>
                <th style="text-align:left">${(0, lodash_1.startCase)((0, lodash_1.camelCase)(key))}:</th>
                <td style="padding-left: 5px;">${value}</td>
            </tr>`;
        }
        this.bodyJson.push(element);
    }
    addWarningList(warnings) {
        let element = {
            tagName: 'mj-text',
            attributes: {
                'color': 'orange'
            },
            content: '<ul>'
        };
        warnings.forEach(row => {
            //console.log(`${key}: ${value}`);
            element.content += `
                <li>${row}</li>
            `;
        });
        element.content += `</ul>`;
        this.bodyJson.push(element);
    }
    addErrorList(errors) {
        let element = {
            tagName: 'mj-text',
            attributes: {
                'color': 'red'
            },
            content: '<ul>'
        };
        errors.forEach(row => {
            //console.log(`${key}: ${value}`);
            element.content += `
                <li>${row}</li>
            `;
        });
        element.content += `</ul>`;
        this.bodyJson.push(element);
    }
    addList(errors) {
        let element = {
            tagName: 'mj-text',
            attributes: {},
            content: '<ul>'
        };
        errors.forEach(row => {
            //console.log(`${key}: ${value}`);
            element.content += `
                <li>${row}</li>
            `;
        });
        element.content += `</ul>`;
        this.bodyJson.push(element);
    }
    generate() {
        this.mjml = (0, mjml_1.default)(this.json);
        this.html = this.mjml.html;
        //console.log(this.mjml.errors)
    }
    send() {
        var _a;
        (_a = this.json.children) === null || _a === void 0 ? void 0 : _a.push({
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
        });
        this.generate();
        this.message.html = this.html;
        this.transporter.sendMail(this.message, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}
exports.Email = Email;
