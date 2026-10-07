// Smooth-scroll to a section below the fixed navbar.
export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (!element) return;
  const yOffset = -70;
  const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
};
