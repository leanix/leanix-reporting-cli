export default function factSheetMapper(fs) {
  return `
    <h4>${fs.displayName}</h4>
    <div style="font-size: 11px">${_.escape(fs.description)}</div>
  `;
}
