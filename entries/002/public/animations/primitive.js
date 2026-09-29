let primitiveDevTools;

gsap.registerPlugin(CustomEase);
CustomEase.create("custom", "M0,0 C0.221,0.173 0.677,0.297 1,1 ");

function initPrimitiveOverlap(container) {
  const stem = container.querySelector("#stem");
  const upperPolygon = container.querySelector("#upper-polygon");
  const lowerPolygon = container.querySelector("#lower-polygon");

  if (!stem || !upperPolygon || !lowerPolygon) {
    console.warn("Primitive Overlap SVG elements were not found.");
    return;
  }

  const hinge = "61 110";

  const originalOpacity = {
    stem: Number(gsap.getProperty(stem, "opacity")),
    upper: Number(gsap.getProperty(upperPolygon, "opacity")),
    lower: Number(gsap.getProperty(lowerPolygon, "opacity")),
  };

  gsap.set([upperPolygon, lowerPolygon], { svgOrigin: hinge });

  const timeline = gsap.timeline({ id: "primitive-overlap-timeline", repeat: 2, repeatDelay: 0.5 });

  timeline
    // Both polygons move from the original state
    .to(upperPolygon, { rotation: 23, duration: 1, ease: "power2.inOut" })
    .to(lowerPolygon, { rotation: -10, duration: 1, ease: "power2.inOut" }, "<")

    // Both polygons return to the original position
    .to(upperPolygon, { rotation: 0, duration: 1, ease: "power2.inOut" })
    .to(lowerPolygon, { rotation: 0, duration: 1, ease: "power2.inOut" }, "<")

    // Tonal contrast changes during the upward return
    .to([stem, upperPolygon], { opacity: 1, duration: 1, ease: "power2.inOut" }, "<")
    .to(lowerPolygon, { opacity: 0.3, duration: 1, ease: "power2.inOut" }, "<")

    // Meet while the P tonality returns seamlessly to the original state
    .addLabel("meet")
    .to(upperPolygon, { rotation: 23, duration: 1, ease: "power2.inOut" }, "meet")
    .to(lowerPolygon, { rotation: -10, duration: 1, ease: "power2.inOut" }, "meet")
    .to(stem, { opacity: originalOpacity.stem, duration: 0.18, ease: "custom" }, "meet+=0.12")
    .to(upperPolygon, { opacity: originalOpacity.upper, duration: 0.18, ease: "custom" }, "meet+=0.12")
    .to(lowerPolygon, { opacity: originalOpacity.lower, duration: 0.18, ease: "custom" }, "meet+=0.12")

    // Form the B as the upper and lower polygons separate
    .addLabel("separate")
    .to(upperPolygon, { rotation: 0, duration: 1, ease: "power2.inOut" }, "separate")
    .to(lowerPolygon, { rotation: 0, duration: 1, ease: "power2.inOut" }, "separate")
    .to([stem, upperPolygon, lowerPolygon], { opacity: 1, duration: 0.18, ease: "custom" }, "separate+=0.82");

  //   if (primitiveDevTools) primitiveDevTools.kill();
  //   primitiveDevTools = GSDevTools.create({
  //     id: "primitive-overlap-devtools",
  //     animation: timeline,
  //     loop: false,
  //     paused: false,
  //     persist: false,
  //   });

  return timeline;
}
