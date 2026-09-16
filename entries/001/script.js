gsap.registerPlugin(GSDevTools, ScrollTrigger, SplitText, ScrollSmoother);

const treatments = gsap.utils.toArray(".scene-1 .coffee-set");

if (treatments.length) {
  const splitTreatments = treatments.map((treatment) => SplitText.create(treatment, { type: "chars" }));
  const treatmentTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  splitTreatments.forEach((splitTreatment, index) => {
    treatmentTimeline
      .set(treatments[index], { opacity: 1 })
      .from(splitTreatment.chars, {
        opacity: 0,
        y: 40,
        rotateX: -90,
        duration: 0.7,
        stagger: 0.05,
        ease: "back.out(1.7)",
      })
      .to(
        splitTreatment.chars,
        { opacity: 0, y: -40, rotateX: 90, duration: 0.6, stagger: 0.04, ease: "power2.in" },
        "+=0.8",
      )
      .set(treatments[index], { opacity: 0 });
  });
}

GSDevTools.create();
