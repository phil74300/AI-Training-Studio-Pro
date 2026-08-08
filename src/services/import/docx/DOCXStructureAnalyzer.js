const defaultTitle = (fileName) =>
  (fileName || "Imported DOCX").replace(/\.docx$/i, "") || "Imported DOCX";

export class DOCXStructureAnalyzer {
  analyze(parsedDocument, options = {}) {
    const title =
      parsedDocument.metadata.title ||
      parsedDocument.elements.find(
        (element) => element.type === "heading" && element.level === 1
      )?.text ||
      defaultTitle(options.fileName);
    const chapters = [];
    let chapter;
    let section;

    const ensureChapter = (location) => {
      if (!chapter) {
        chapter = { title, location, sections: [] };
        chapters.push(chapter);
      }
      return chapter;
    };
    const ensureSection = (location) => {
      ensureChapter(location);
      if (!section) {
        section = { title: "Content", location, blocks: [] };
        chapter.sections.push(section);
      }
      return section;
    };

    parsedDocument.elements.forEach((element) => {
      if (element.type === "heading" && element.level === 1) {
        if (element.text === title && chapters.length === 0) return;
        chapter = {
          title: element.text,
          location: element.location,
          sections: [],
        };
        chapters.push(chapter);
        section = null;
        return;
      }
      if (element.type === "heading" && element.level === 2) {
        ensureChapter(element.location);
        section = {
          title: element.text,
          location: element.location,
          blocks: [],
        };
        chapter.sections.push(section);
        return;
      }
      if (element.type !== "image")
        ensureSection(element.location).blocks.push(element);
    });

    if (!chapters.length)
      ensureSection({ type: "document-order", index: 0, pageNumber: null });

    return {
      version: 1,
      title,
      headingCount: parsedDocument.elements.filter(
        (element) => element.type === "heading"
      ).length,
      chapters,
      images: parsedDocument.elements.filter(
        (element) => element.type === "image"
      ),
    };
  }
}
