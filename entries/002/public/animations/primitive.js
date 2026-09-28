/* Animation for Primitive Overlap */

function initPrimitiveOverlap(container) {
  const upperPolygon = container.querySelector("#upper-polygon");
  const lowerPolygon = container.querySelector("#lower-polygon");

  if (!upperPolygon || !lowerPolygon) {
    console.warn("Primitive Overlap SVG elements were not found.");
    return;
  }

  const hinge = "61 110";

  gsap.set([upperPolygon, lowerPolygon], { svgOrigin: hinge });

  return gsap
    .timeline({ repeat: -1, yoyo: true })
    .to(upperPolygon, { rotation: -15, duration: 1, ease: "power2.inOut" }, 0)
    .to(lowerPolygon, { rotation: 15, duration: 1, ease: "power2.inOut" }, 0);
}
