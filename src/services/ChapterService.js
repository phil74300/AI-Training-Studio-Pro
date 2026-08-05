let chapters = [];

export function getChapters() {
  return chapters;
}

export function createChapter(title) {

  const chapter = {

    id: crypto.randomUUID(),

    title,

    content: "",

    createdAt: new Date().toLocaleString()

  };

  chapters.push(chapter);

  return chapter;
}

export function deleteChapter(id) {

  chapters = chapters.filter(
    chapter => chapter.id !== id
  );

}