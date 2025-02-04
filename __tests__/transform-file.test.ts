import * as path from "path";
import * as fs from "fs/promises";
import FormDataTransformer from "../src/utils/file-transformer";
import { cwd } from "process";

describe("FormDataTransformer", () => {
  it("transforms a file into a valid multipart form-data buffer", async () => {
    try {
      // Arrange: Build the absolute path for your sample file.
      const filePath = path.join(cwd(), "assets", "sample.png");
      const transformer = new FormDataTransformer();

      // Read the original file for later comparison.
      const originalFileBuffer = await fs.readFile(filePath);

      // Act: Transform the file.
      const multipartBuffer = await transformer.transformFile(filePath);
      const multipartString = multipartBuffer.toString("utf8");

      // Extract the boundary from the content-type header.
      const contentTypeHeader = transformer.getContentTypeHeader();
      const boundary = contentTypeHeader.split("boundary=")[1];

      // Expected header parts.
      const expectedHeader = `--${boundary}`;
      const expectedDisposition = `Content-Disposition: form-data; name="file"; filename="${path.basename(
        filePath
      )}"`;
      // Assuming the .png type wasn’t registered, the default content type is used:
      const expectedContentType = "Content-Type: application/octet-stream";
      const expectedFooter = `--${boundary}--`;

      // Assert the multipart structure.
      expect(multipartString.startsWith(expectedHeader)).toBe(true);
      expect(multipartString).toContain(expectedDisposition);
      expect(multipartString).toContain(expectedContentType);
      expect(multipartString).toContain(expectedFooter);

      // Assert that the transformed buffer contains the original file's data.
      expect(
        multipartBuffer.indexOf(originalFileBuffer)
      ).toBeGreaterThanOrEqual(0);
    } catch (error) {
      console.error((error as Error).stack);
      throw error; // rethrow so Jest still marks the test as failed
    }
  });
});
