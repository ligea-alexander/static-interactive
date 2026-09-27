function renderPixlBloomMark(container) {
  container.innerHTML = `
    <div class="live-wrap">
      <svg viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg">
        <g class="live-cells">
          <rect class="cell cell-ink" x="0" y="20" width="90" height="150"/>
          <rect class="cell cell-paper" x="90" y="20" width="90" height="150"/>
          <rect class="cell cell-ink" x="0" y="180" width="90" height="150"/>
          <rect class="cell cell-paper" x="90" y="180" width="90" height="150"/>
        </g>
        <g class="live-bowls"><circle cx="245" cy="115" r="100"/><circle cx="245" cy="250" r="100"/></g>
      </svg>
      <div class="wordmark"><span class="big">PixlBloom</span><span class="small">N&nbsp;&nbsp;Y&nbsp;&nbsp;C</span></div>
    </div>`;

  const cells = container.querySelectorAll(".live-cells .cell");
  const bowls = container.querySelectorAll(".live-bowls circle");

  gsap.set(cells, { opacity: 0, scale: 0.6, transformOrigin: "center" });
  gsap.set(bowls, { scale: 0, transformOrigin: "center" });
  gsap
    .timeline()
    .to(cells, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2)" })
    .to(bowls, { scale: 1, duration: 0.7, stagger: 0.12, ease: "elastic.out(1,0.6)" }, "<0.1")
    .call(() => {
      gsap.to(bowls, {
        scale: 1.03,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.4, yoyo: true },
      });
      cells.forEach((cell, index) => {
        gsap.to(cell, {
          opacity: 0.55,
          duration: 0.9 + Math.random() * 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.6 + Math.random(),
        });
      });
    });
}

window.animationRegistry = { ...(window.animationRegistry || {}), pixlbloom: renderPixlBloomMark };
