// Minimal reportWebVitals implementation without external dependencies
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Use Navigation Timing API if available
    if (window.performance && window.performance.timing) {
      const perfTiming = window.performance.timing;
      const pageLoadTime = perfTiming.loadEventEnd - perfTiming.navigationStart;
      onPerfEntry({ name: 'page-load', value: pageLoadTime });
    } else {
      console.debug('Performance API not available');
    }
  }
};

export default reportWebVitals;
