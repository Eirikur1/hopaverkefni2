export function initSplitFade(selector = ".tit"): void {
  const elements = document.querySelectorAll<HTMLElement>(selector);

  const split = (el: HTMLElement) => {
    if (el.dataset.splitDone) return;

    const text = el.textContent ?? "";
    el.textContent = "";

    const frag = document.createDocumentFragment();
    let index = 0;

    text.split(" ").forEach((word, wIdx, words) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "sf-word";

      for (const ch of word) {
        const span = document.createElement("span");
        span.className = "sf-char";
        span.textContent = ch;
        span.style.setProperty("--i", String(index++));
        wordWrap.appendChild(span);
      }

      if (wIdx < words.length - 1) {
        const space = document.createElement("span");
        space.className = "sf-char sf-space";
        space.textContent = " ";
        space.style.setProperty("--i", String(index++));
        wordWrap.appendChild(space);
      }

      frag.appendChild(wordWrap);
    });

    el.appendChild(frag);
    el.dataset.splitDone = "1";
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          split(el);
          el.classList.add("sf-inview");
          io.unobserve(el);
        }
      }
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => {
    split(el);
    io.observe(el);
  });
}
