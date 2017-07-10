export default function factSheetMapper(fs) {
  return `
    <h6>${fs.displayName}</h6>
    <div style="font-size: 11px">${_.escape(fs.description)}</div>
  `;
}
