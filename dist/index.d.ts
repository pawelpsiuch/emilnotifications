import { MJMLParseResults } from 'mjml-core';
type EmailPayload = {
    to: string | string[];
    cc?: string | string[];
    subject: string;
    attachments?: any[];
};
type NodemailerEmail = {
    from?: string;
    to: string[];
    cc?: string[];
    subject: string;
    html?: string;
    attachments?: any[];
};
interface MJMLJsonObject {
    tagName: string;
    attributes: object;
    children?: MJMLJsonObject[];
    content?: string;
}
export declare class Email {
    mjml?: MJMLParseResults;
    html: string;
    json: MJMLJsonObject;
    message: NodemailerEmail;
    transporter: any;
    bodyJson: MJMLJsonObject[];
    constructor(transporter: any, input: EmailPayload);
    addLogo(src: string): void;
    addRaw(text: string): void;
    addTable(data: object[]): void;
    addTitle(text: string): void;
    addDivider(): void;
    addObjectList(listData: object): void;
    addWarningList(warnings: string[]): void;
    addErrorList(errors: string[]): void;
    addList(errors: string[]): void;
    generate(): void;
    send(): void;
}
export {};
