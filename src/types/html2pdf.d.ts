declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string | number[];
      orientation?: 'portrait' | 'landscape';
      [key: string]: any;
    };
    pagebreak?: {
      mode?: string | string[];
      [key: string]: any;
    };
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    toPdf(): Html2PdfInstance;
    toCanvas(): Html2PdfInstance;
    toImg(): Html2PdfInstance;
    outputPdf(type?: string): Promise<Blob>;
    save(filename?: string): Promise<void>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}
