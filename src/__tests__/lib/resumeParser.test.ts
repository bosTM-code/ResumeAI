import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockExtractRawText, mockGetDocument, mockGetPage, mockGetTextContent } = vi.hoisted(() => ({
  mockExtractRawText: vi.fn(),
  mockGetDocument: vi.fn(),
  mockGetPage: vi.fn(),
  mockGetTextContent: vi.fn(),
}));

vi.mock("mammoth", () => ({
  default: { extractRawText: mockExtractRawText },
}));

vi.mock("pdfjs-dist", () => ({
  getDocument: mockGetDocument,
}));

import { extractTextFromFile } from "@/lib/resumeParser";

const MIME_PDF = "application/pdf";
const MIME_DOC = "application/msword";
const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("extractTextFromFile", () => {
  const testBuffer = Buffer.from("fake file content");

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("PDF extraction", () => {
    const setupPdf = (text: string) => {
      mockGetTextContent.mockResolvedValue({ items: [{ str: text }] });
      mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent });
      mockGetDocument.mockReturnValue({
        promise: Promise.resolve({ numPages: 1, getPage: mockGetPage }),
      });
    };

    it("returns extracted text from a PDF buffer", async () => {
      setupPdf("Hello from PDF");

      const result = await extractTextFromFile(testBuffer, MIME_PDF);

      expect(result).toContain("Hello from PDF");
    });

    it("extracts text from a PDF buffer and returns the text field", async () => {
      setupPdf("PDF second result");

      const result = await extractTextFromFile(testBuffer, MIME_PDF);

      expect(result).toContain("PDF second result");
    });

    it("propagates errors thrown by the PDF parser", async () => {
      mockGetTextContent.mockRejectedValue(new Error("Corrupt PDF"));
      mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent });
      mockGetDocument.mockReturnValue({
        promise: Promise.resolve({ numPages: 1, getPage: mockGetPage }),
      });

      await expect(extractTextFromFile(testBuffer, MIME_PDF)).rejects.toThrow("Corrupt PDF");
    });
  });

  describe("DOCX extraction", () => {
    it("returns extracted text from a DOCX buffer", async () => {
      mockExtractRawText.mockResolvedValue({ value: "Hello from DOCX" });

      const result = await extractTextFromFile(testBuffer, MIME_DOCX);

      expect(result).toBe("Hello from DOCX");
    });

    it("passes the original buffer to mammoth", async () => {
      mockExtractRawText.mockResolvedValue({ value: "DOCX text" });

      await extractTextFromFile(testBuffer, MIME_DOCX);

      expect(mockExtractRawText).toHaveBeenCalledWith({ buffer: testBuffer });
    });
  });

  describe("DOC extraction", () => {
    it("returns extracted text from a DOC buffer", async () => {
      mockExtractRawText.mockResolvedValue({ value: "Hello from DOC" });

      const result = await extractTextFromFile(testBuffer, MIME_DOC);

      expect(result).toBe("Hello from DOC");
    });

    it("passes the original buffer to mammoth for DOC files", async () => {
      mockExtractRawText.mockResolvedValue({ value: "DOC text" });

      await extractTextFromFile(testBuffer, MIME_DOC);

      expect(mockExtractRawText).toHaveBeenCalledWith({ buffer: testBuffer });
    });
  });

  describe("unsupported types", () => {
    it("throws for image/png", async () => {
      await expect(extractTextFromFile(testBuffer, "image/png")).rejects.toThrow(
        "Unsupported file type"
      );
    });

    it("throws for text/plain", async () => {
      await expect(extractTextFromFile(testBuffer, "text/plain")).rejects.toThrow(
        "Unsupported file type"
      );
    });

    it("throws for application/zip", async () => {
      await expect(extractTextFromFile(testBuffer, "application/zip")).rejects.toThrow(
        "Unsupported file type"
      );
    });
  });
});
