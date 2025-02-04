interface IFilenameSanitizer {
  /**
   * Sanitizes a filename by escaping backslashes and replacing problematic characters.
   * @param filename - The filename to sanitize.
   * @returns The sanitized filename.
   */
  sanitizeFilename(filename: string): string;
}

class FilenameSanitizer implements IFilenameSanitizer {
  public sanitizeFilename(filename: string): string {
    let sanitized = this.escapeBackslashes(filename);
    sanitized = this.replaceProblematicCharacters(sanitized);
    return sanitized;
  }

  /**
   * Escapes all backslashes in the input string.
   * @param input - The string in which to escape backslashes.
   * @returns The string with each '\' replaced by '\\'.
   */
  private escapeBackslashes(input: string): string {
    return input.replace(this.getBackslashRegex(), "\\\\");
  }

  /**
   * Replaces problematic filename characters with an underscore.
   * Problematic characters include: / ? % * : | " < >
   * (Backslashes are handled separately.)
   * @param input - The string to process.
   * @returns The string with problematic characters replaced.
   */
  private replaceProblematicCharacters(input: string): string {
    return input.replace(this.getProblematicCharactersRegex(), "_");
  }

  /**
   * Returns a regular expression that matches all backslashes.
   * @returns A RegExp for matching backslashes.
   */
  private getBackslashRegex(): RegExp {
    return /\\/g;
  }

  /**
   * Returns a regular expression that matches problematic characters in filenames.
   * Excludes the backslash (which is handled separately).
   * @returns A RegExp for matching characters such as /, ?, %, *, :, |, ", <, >.
   */
  private getProblematicCharactersRegex(): RegExp {
    return /[\/\?%*:|"<>]/g;
  }
}

export { FilenameSanitizer, IFilenameSanitizer };
