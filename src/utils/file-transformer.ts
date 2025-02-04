import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import {
  FilenameSanitizer,
  IFilenameSanitizer,
} from "~/utils/filename-sanitizer";

type ContentTypeMap = Map<string, string>;

/**
 * The external API for transforming files/buffers into multipart form-data.
 */
interface IFormDataTransformer {
  /**
   * Transforms a file buffer into a form-data compatible buffer.
   * @param fileBuffer - The original file buffer.
   * @param filePath - Path to the original file.
   * @param fieldName - (Optional) The form field name. Defaults to "file".
   * @returns The transformed buffer with form-data boundaries.
   */
  transformBuffer(
    fileBuffer: Buffer,
    filePath: string,
    fieldName?: string
  ): Buffer;

  /**
   * Transforms a file into a form-data compatible buffer.
   * @param filePath - Path to the file to transform.
   * @param fieldName - (Optional) The form field name. Defaults to "file".
   * @returns Promise resolving to the transformed buffer.
   */
  transformFile(filePath: string, fieldName?: string): Promise<Buffer>;

  /**
   * Registers a new file type with its corresponding content type.
   * @param extension - File extension including the dot (e.g., '.doc').
   * @param contentType - MIME type for the file.
   */
  registerFileType(extension: string, contentType: string): void;

  /**
   * Gets the content type for a given file path.
   * @param filePath - Path to the file.
   * @returns The content type, or a default of "application/octet-stream".
   */
  getContentType(filePath: string): string;

  /**
   * Gets the Content-Type header for HTTP requests.
   * @returns The Content-Type header value.
   */
  getContentTypeHeader(): string;
}

class FormDataTransformer implements IFormDataTransformer {
  private readonly boundary: string;
  private readonly contentTypeMap: ContentTypeMap;
  private readonly filenameSanitizer: IFilenameSanitizer;

  constructor(boundary?: string) {
    if (boundary) {
      if (!this.isValidBoundary(boundary)) {
        throw new Error(
          'Invalid boundary provided. The boundary must be between 1 and 70 printable ASCII characters and must not contain any of the following characters: ()<>@,;:\\"/[]?='
        );
      }
      this.boundary = boundary;
    } else {
      // Generate a random boundary if one isn't provided.
      this.boundary = `----WebKitFormBoundary${crypto
        .randomBytes(16)
        .toString("hex")}`;
    }

    this.contentTypeMap = new Map<string, string>([
      [".pdf", "application/pdf"],
      [".mp3", "audio/mpeg"],
      [".wav", "audio/wav"],
      [".m4a", "audio/mp4"],
      [".ogg", "audio/ogg"],
    ]);

    this.filenameSanitizer = new FilenameSanitizer();
  }

  public registerFileType(extension: string, contentType: string): void {
    if (!extension.startsWith(".")) {
      throw new Error("Extension must start with a dot (.)");
    }
    this.contentTypeMap.set(extension.toLowerCase(), contentType);
  }

  public getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return this.contentTypeMap.get(ext) || "application/octet-stream";
  }

  public transformBuffer(
    fileBuffer: Buffer,
    filePath: string,
    fieldName = "file"
  ): Buffer {
    const crlf = "\r\n";
    const contentType = this.getContentType(filePath);
    const fileName = this.filenameSanitizer.sanitizeFilename(
      path.basename(filePath)
    );

    const headerLines = [
      `--${this.boundary}`,
      `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"`,
      `Content-Type: ${contentType}`,
      "", // Blank line indicates end of headers.
      "",
    ];
    const header = headerLines.join(crlf);
    const footer = `${crlf}--${this.boundary}--${crlf}`;

    return Buffer.concat([
      Buffer.from(header),
      fileBuffer,
      Buffer.from(footer),
    ]);
  }

  public async transformFile(
    filePath: string,
    fieldName = "file"
  ): Promise<Buffer> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return this.transformBuffer(fileBuffer, filePath, fieldName);
    } catch (error) {
      throw new Error(
        `Failed to read file "${filePath}": ${(error as Error).message}`
      );
    }
  }

  public getContentTypeHeader(): string {
    return `multipart/form-data; boundary=${this.boundary}`;
  }

  /**
   * Validates the boundary string against RFC 2046 specifications.
   * The boundary must:
   *   - Be between 1 and 70 characters long.
   *   - Consist only of printable US-ASCII characters (33-126).
   *   - Not contain any of these characters: ()<>@,;:\\"/[]?=
   * @param boundary - The boundary string to validate.
   * @returns true if the boundary is valid; false otherwise.
   */
  private isValidBoundary(boundary: string): boolean {
    const regex = /^(?!.*[()<>@,;:"/[\]?=])[\x21-\x7E]{1,70}$/;
    return regex.test(boundary);
  }
}

export default FormDataTransformer;
