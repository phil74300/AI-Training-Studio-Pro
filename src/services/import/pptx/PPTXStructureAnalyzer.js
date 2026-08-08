const defaultTitle = (fileName) =>
  (fileName || "Imported PPTX").replace(/\.pptx$/i, "") || "Imported PPTX";

export class PPTXStructureAnalyzer {
  analyze(parsedPresentation, options = {}) {
    const title =
      parsedPresentation.metadata.title ||
      parsedPresentation.slides.find(
        (slide) => slide.title !== `Slide ${slide.slideNumber}`
      )?.title ||
      defaultTitle(options.fileName);
    return {
      version: 1,
      title,
      slides: parsedPresentation.slides.map((slide) => {
        const blocks = [];
        let list;
        slide.elements.forEach((element) => {
          if (element.type === "list-item") {
            if (!list || list.ordered !== element.ordered) {
              list = {
                type: "list",
                ordered: element.ordered,
                items: [],
                location: element.location,
              };
              blocks.push(list);
            }
            list.items.push(element.text);
            return;
          }
          list = null;
          if (element.type !== "image") blocks.push(element);
        });
        if (slide.notes)
          blocks.push({
            type: "paragraph",
            text: slide.notes,
            sourceRole: "speaker-notes",
            location: { type: "slide-notes", slideNumber: slide.slideNumber },
          });
        return { ...slide, blocks };
      }),
      images: parsedPresentation.images,
      unsupportedElements: parsedPresentation.unsupportedElements,
    };
  }
}
