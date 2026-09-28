let primitiveDevTools;

gsap.registerPlugin(CustomEase);
CustomEase.create("custom", "M0,0 C0.15,0.026 0.875,0.221 1,1");

function initPrimitiveOverlap(container) {
  const stem = container.querySelector("#stem");
  const upperPolygon = container.querySelector("#upper-polygon");
  const lowerPolygon = container.querySelector("#lower-polygon");

  if (!stem || !upperPolygon || !lowerPolygon) {
    console.warn("Primitive Overlap SVG elements were not found.");
    return;
  }

  const hinge = "61 110";

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
    // Mark the beginning of the second downward movement
    .addLabel("second-lower")

    // Upper polygon lowers again
    .to(upperPolygon, { rotation: 23, duration: 1, ease: "power2.inOut" }, "second-lower")
    .to(lowerPolygon, { rotation: -10, duration: 1, ease: "power2.inOut" }, "second-lower")

    // Pronounce the complete B as the two moving forms meet
    .to([stem, upperPolygon, lowerPolygon], { opacity: 1, duration: 0.12, ease: "custom" }, "second-lower+=0.62");

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
