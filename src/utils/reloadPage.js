export const reloadPage = () => {
  // Wrapped for easier mocking in tests and centralized future behavior changes.
  window.location.reload();
};
