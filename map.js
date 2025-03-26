// On page load, fill #dotted-map with a dotted pattern or highlight Alberta
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('dotted-map');
    if (!mapContainer) return;
    
    // Clear anything that was there
    mapContainer.innerHTML = '';
  
    // Example: A 10 x 10 grid of black squares for a dotted look
    const rows = 10;
    const cols = 10;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dot = document.createElement('div');
        dot.style.display = 'inline-block';
        dot.style.width = '5px';
        dot.style.height = '5px';
        dot.style.margin = '2px';
        dot.style.backgroundColor = 'black';
        mapContainer.appendChild(dot);
      }
      mapContainer.appendChild(document.createElement('br'));
    }
});