const BULLET = /^([•◦▪‣–—*-])\s*(.+)$/u;
const NUMBERED = /^(\d+|[a-z])[.)]\s+(.+)$/i;
const PAGE_NUMBER = /^(page\s+)?\d+(\s+of\s+\d+)?$/i;

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 12;
};

const linesForPage = (page) => {
  const lines = [];
  const items = [...page.textItems].sort(
    (left, right) => right.y - left.y || left.x - right.x
  );

  items.forEach((item) => {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 3);
    if (line) {
      line.items.push(item);
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  });

  return lines
    .sort((left, right) => right.y - left.y)
    .map((line) => {
      const ordered = line.items.sort((left, right) => left.x - right.x);
      return {
        pageNumber: page.pageNumber,
        pageHeight: page.height,
        y: line.y,
        text: ordered
          .map((item) => item.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
        fontSize: Math.max(...ordered.map((item) => item.fontSize || 0)),
        columns: ordered.map((item) => ({ x: item.x, text: item.text })),
      };
    })
    .filter((line) => line.text);
};

const isPageNumber = (line) =>
  PAGE_NUMBER.test(line.text) &&
  (line.y < line.pageHeight * 0.12 || line.y > line.pageHeight * 0.9);

const alignedColumns = (left, right) =>
  left.columns.length === right.columns.length &&
  left.columns.length >= 2 &&
  left.columns.every(
    (column, index) => Math.abs(column.x - right.columns[index].x) < 12
  );

export class PDFStructureAnalyzer {
  analyze(parsedDocument) {
    const lines = parsedDocument.pages.flatMap(linesForPage);
    const contentLines = lines.filter((line) => !isPageNumber(line));

    if (!contentLines.length) {
      const metadataTitle = parsedDocument.metadata.Title;
      const title =
        (typeof metadataTitle === "string" && metadataTitle.trim()) ||
        "Imported PDF";

      return {
        version: 1,
        title,
        bodyFontSize: null,
        headingCount: 0,
        chapters: [
          {
            title,
            pageNumber: 1,
            sections: [{ title: "Content", pageNumber: 1, blocks: [] }],
          },
        ],
        pageNumbers: [],
        images: parsedDocument.pages.flatMap((page) => page.images),
      };
    }

    const bodySize = median(
      contentLines.map((line) => line.fontSize).filter(Boolean)
    );
    const headingSizes = [
      ...new Set(
        contentLines
          .filter(
            (line) =>
              line.fontSize >= bodySize * 1.18 &&
              line.text.length <= 140 &&
              !BULLET.test(line.text) &&
              !NUMBERED.test(line.text)
          )
          .map((line) => Math.round(line.fontSize * 10) / 10)
      ),
    ].sort((left, right) => right - left);
    const headingLevel = (line) => {
      const index = headingSizes.findIndex(
        (size) => Math.abs(size - line.fontSize) < 0.2
      );
      return index < 0 ? null : Math.min(index + 1, 3);
    };

    const titleCandidate = contentLines
      .filter((line) => line.pageNumber === 1 && headingLevel(line))
      .sort(
        (left, right) => right.fontSize - left.fontSize || right.y - left.y
      )[0];
    const metadataTitle = parsedDocument.metadata.Title;
    const title =
      (typeof metadataTitle === "string" && metadataTitle.trim()) ||
      titleCandidate?.text ||
      "Imported PDF";
    const blocks = [];

    for (let index = 0; index < contentLines.length; index += 1) {
      const line = contentLines[index];
      if (line === titleCandidate) continue;

      const level = headingLevel(line);
      if (level) {
        blocks.push({
          type: "heading",
          level,
          text: line.text,
          pageNumbers: [line.pageNumber],
        });
        continue;
      }

      const bullet = BULLET.exec(line.text);
      const numbered = NUMBERED.exec(line.text);
      if (bullet || numbered) {
        const ordered = Boolean(numbered);
        const items = [];
        let cursor = index;
        while (cursor < contentLines.length) {
          const match = (ordered ? NUMBERED : BULLET).exec(
            contentLines[cursor].text
          );
          if (!match) break;
          items.push(match[2]);
          cursor += 1;
        }
        blocks.push({
          type: "list",
          ordered,
          items,
          text: items.join("\n"),
          pageNumbers: [
            ...new Set(
              contentLines.slice(index, cursor).map((item) => item.pageNumber)
            ),
          ],
        });
        index = cursor - 1;
        continue;
      }

      if (
        contentLines[index + 1] &&
        alignedColumns(line, contentLines[index + 1])
      ) {
        const rows = [line.columns.map((column) => column.text)];
        let cursor = index + 1;
        while (
          cursor < contentLines.length &&
          alignedColumns(line, contentLines[cursor])
        ) {
          rows.push(contentLines[cursor].columns.map((column) => column.text));
          cursor += 1;
        }
        blocks.push({
          type: "table",
          rows,
          text: null,
          pageNumbers: [
            ...new Set(
              contentLines.slice(index, cursor).map((item) => item.pageNumber)
            ),
          ],
        });
        index = cursor - 1;
        continue;
      }

      blocks.push({
        type: "paragraph",
        text: line.text,
        pageNumbers: [line.pageNumber],
      });
    }

    const chapters = [];
    let chapter;
    let section;
    const ensureChapter = () => {
      if (!chapter) {
        chapter = { title: title, pageNumber: 1, sections: [] };
        chapters.push(chapter);
      }
      return chapter;
    };
    const ensureSection = (pageNumber = 1) => {
      ensureChapter();
      if (!section) {
        section = { title: "Content", pageNumber, blocks: [] };
        chapter.sections.push(section);
      }
      return section;
    };

    blocks.forEach((block) => {
      if (block.type === "heading" && block.level === 1) {
        chapter = {
          title: block.text,
          pageNumber: block.pageNumbers[0],
          sections: [],
        };
        chapters.push(chapter);
        section = null;
      } else if (block.type === "heading" && block.level === 2) {
        ensureChapter();
        section = {
          title: block.text,
          pageNumber: block.pageNumbers[0],
          blocks: [],
        };
        chapter.sections.push(section);
      } else {
        ensureSection(block.pageNumbers[0]).blocks.push(block);
      }
    });

    const pageNumbers = lines.filter(isPageNumber).map((line) => ({
      pageNumber: line.pageNumber,
      label: line.text,
    }));

    return {
      version: 1,
      title,
      bodyFontSize: bodySize,
      headingCount:
        blocks.filter((block) => block.type === "heading").length +
        (titleCandidate ? 1 : 0),
      chapters,
      pageNumbers,
      images: parsedDocument.pages.flatMap((page) => page.images),
    };
  }
}
