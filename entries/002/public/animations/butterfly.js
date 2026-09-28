/* Animation for Geometry Meets Organic Form */

function initButterfly(container) {
  const mediumWing = container.querySelector("#wing_medium");
  const lightWing = container.querySelector("#wing_light");
  const darkWing = container.querySelector("#wing_dark");
  const body = container.querySelector("#thorax_abdomen");

  if (!mediumWing || !lightWing || !darkWing || !body) {
    console.warn("Butterfly SVG elements were not found.");
    return;
  }

  const wingMotion = {
    dark: { hinge: "40 140", scaleX: -0.1, rotation: -8 },
    light: { hinge: "52 178", scaleY: 0.6 },
    medium: { hinge: "54 150", scaleX: 0.4 },
  };

  gsap.set(darkWing, { svgOrigin: wingMotion.dark.hinge });
  gsap.set(lightWing, { svgOrigin: wingMotion.light.hinge });
  gsap.set(mediumWing, { svgOrigin: wingMotion.medium.hinge });

  const originalOpacity = {
    dark: Number(gsap.getProperty(darkWing, "opacity")),
    medium: Number(gsap.getProperty(mediumWing, "opacity")),
    body: Number(gsap.getProperty(body, "opacity")),
  };
  const originalMediumFill = gsap.getProperty(mediumWing, "fill");

  const timeline = gsap.timeline({ id: "butterfly-timeline", repeat: -1 });
  timeline.timeScale(1.8);

  timeline
    .addLabel("first-expand")
    .to(
      darkWing,
      { scaleX: wingMotion.dark.scaleX, rotation: wingMotion.dark.rotation, duration: 1.2, ease: "sine.inOut" },
      "first-expand",
    )
    .to(mediumWing, { scaleX: wingMotion.medium.scaleX, duration: 1.2, ease: "sine.inOut" }, "first-expand+=0.08")
    .to(lightWing, { scaleY: wingMotion.light.scaleY, duration: 1.2, ease: "sine.inOut" }, "first-expand+=0.16")
    .to(body, { opacity: originalOpacity.body, duration: 0.4, ease: "sine.inOut" }, "first-expand")
    .to(darkWing, { opacity: originalOpacity.dark, duration: 0.4, ease: "sine.inOut" }, "first-expand")
    .to(
      mediumWing,
      { opacity: originalOpacity.medium, fill: originalMediumFill, duration: 0.4, ease: "sine.inOut" },
      "first-expand",
    )
    .addLabel("first-collapse")
    .to(lightWing, { scaleY: 1, duration: 1.2, ease: "sine.inOut" }, "first-collapse")
    .to(mediumWing, { scaleX: 1, duration: 1.2, ease: "sine.inOut" }, "first-collapse+=0.08")
    .to(darkWing, { scaleX: 1, rotation: 0, duration: 1.2, ease: "sine.inOut" }, "first-collapse+=0.16")
    .addLabel("p-landing")
    .to([body, darkWing], { opacity: 1, duration: 0.18, ease: "sine.out" }, "p-landing")
    .to({}, { duration: 0.45 })

    .addLabel("second-expand")
    .to(
      darkWing,
      { scaleX: wingMotion.dark.scaleX, rotation: wingMotion.dark.rotation, duration: 1.2, ease: "sine.inOut" },
      "second-expand",
    )
    .to(mediumWing, { scaleX: wingMotion.medium.scaleX, duration: 1.2, ease: "sine.inOut" }, "second-expand+=0.08")
    .to(lightWing, { scaleY: wingMotion.light.scaleY, duration: 1.2, ease: "sine.inOut" }, "second-expand+=0.16")
    .to(body, { opacity: originalOpacity.body, duration: 0.4, ease: "sine.inOut" }, "second-expand")
    .to(darkWing, { opacity: originalOpacity.dark, duration: 0.4, ease: "sine.inOut" }, "second-expand")
    .to(mediumWing, { fill: originalMediumFill, duration: 0.4, ease: "sine.inOut" }, "second-expand")
    .addLabel("second-collapse")
    .to(lightWing, { scaleY: 1, duration: 1.2, ease: "sine.inOut" }, "second-collapse")
    .to(mediumWing, { scaleX: 1, duration: 1.2, ease: "sine.inOut" }, "second-collapse+=0.08")
    .to(darkWing, { scaleX: 1, rotation: 0, duration: 1.2, ease: "sine.inOut" }, "second-collapse+=0.16")
    .addLabel("b-landing")
    .to(body, { opacity: 1, duration: 0.18, ease: "sine.out" }, "b-landing")
    .to(darkWing, { opacity: 1, duration: 0.18, ease: "sine.out" }, "b-landing")
    .to(mediumWing, { opacity: 1, fill: "#000", duration: 0.18, ease: "sine.out" }, "b-landing")
    .to({}, { duration: 1 });

  return timeline;
}
