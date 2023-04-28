interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  template?: string;
  context: object;
}

export default SendEmailOptions;
