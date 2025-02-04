import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

type ContentTypeMap = Map<string, string>;

interface IFormDataTransformer {
  transformBuffer(fileBuffer: Buffer, filePath: string): Buffer;
  transformFile(filePath: string): Promise<Buffer>;
  registerFileType(extension: string, contentType: string): void;
  getContentType(filePath: string): string;
  getContentTypeHeader(): string;
}

class FormDataTransformer implements IFormDataTransformer {
  private readonly boundary: string | undefined;
  private readonly contentTypeMap: ContentTypeMap;

  constructor() {
    this.boundary = `----WebKitFormBoundary${crypto
      .randomBytes(16)
      .toString("hex")}`;
    this.contentTypeMap = new Map([
      [".pdf", "application/pdf"],
      [".mp3", "audio/mpeg"],
      [".wav", "audio/wav"],
      [".m4a", "audio/mp4"],
      [".ogg", "audio/ogg"],
    ]);
  }

  /**
   * Registers a new file type with its corresponding content type
   * @param extension - File extension including the dot (e.g., '.doc')
   * @param contentType - MIME type for the file
   * @throws Error if extension doesn't start with a dot
   */
  public registerFileType(extension: string, contentType: string): void {
    if (!extension.startsWith(".")) {
      throw new Error("Extension must start with a dot (.)");
    }
    this.contentTypeMap.set(extension.toLowerCase(), contentType);
  }

  /**
   * Gets the content type for a given file path
   * @param filePath - Path to the file
   * @returns Content type or default octet-stream
   */
  public getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return this.contentTypeMap.get(ext) || "application/octet-stream";
  }

  /**
   * Transforms a file buffer into a form-data compatible buffer
   * @param fileBuffer - The original file buffer
   * @param filePath - Path to the original file
   * @returns Transformed buffer with form-data boundaries
   */
  public transformBuffer(fileBuffer: Buffer, filePath: string): Buffer {
    const contentType = this.getContentType(filePath);

    return Buffer.concat([
      Buffer.from(`--${this.boundary}\r\n`),
      Buffer.from(
        `Content-Disposition: form-data; name="file"; filename="${path.basename(
          filePath
        )}"\r\n`
      ),
      Buffer.from(`Content-Type: ${contentType}\r\n\r\n`),
      fileBuffer,
      Buffer.from(`\r\n--${this.boundary}--\r\n`),
    ]);
  }

  /**
   * Transforms a file into a form-data compatible buffer
   * @param filePath - Path to the file to transform
   * @returns Promise resolving to transformed buffer with form-data boundaries
   * @throws Error if file cannot be read
   */
  public async transformFile(filePath: string): Promise<Buffer> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return this.transformBuffer(fileBuffer, filePath);
    } catch (error) {
      throw new Error(`Failed to read file: ${(error as Error).message}`);
    }
  }

  /**
   * Gets the content type header for use in HTTP requests
   * @returns Content type header value
   */
  public getContentTypeHeader(): string {
    return `multipart/form-data; boundary=${this.boundary}`;
  }
}

export default FormDataTransformer;
