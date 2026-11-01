'use strict';
const size = document.querySelector('#font-size');
const sizeValue = document.querySelector('#font-size-value');
const sample = document.querySelector('#font-sample');
const status = document.querySelector('#font-status');
size.addEventListener('input', () => {
  document.documentElement.style.setProperty('--specimen-size', `${size.value}px`);
  sizeValue.textContent = `${size.value} px`;
});
// Editable wording is only included in the owner’s local, private preview.
if (sample) sample.addEventListener('input', () => {
  document.querySelectorAll('.font-sample').forEach(element => { element.textContent = sample.value; });
});
async function verifyFonts() {
  try {
    const specimens = Array.from(document.querySelectorAll('.font-sample'));
    const results = await Promise.all(specimens.map(element => {
      const style = getComputedStyle(element);
      return document.fonts.load(`${style.fontWeight} 24px ${style.fontFamily}`, element.textContent);
    }));
    if (results.some(fonts => fonts.length === 0)) throw new Error('Typeface unavailable');
    status.textContent = 'Static specimens · typefaces loaded';
  } catch {
    status.textContent = 'Some fonts could not load. Try reloading or follow the source links.';
  }
}
verifyFonts();
