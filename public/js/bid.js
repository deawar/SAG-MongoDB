// $(document).ready(() => {
//   $('.sidenav').sidenav();
//   $('.materialboxed').materialbox();
// });
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidenav').forEach((elem) => {
    // Initialize sidenav (Replace with actual Materialize JS method if needed)
    M.Sidenav.init(elem);
  });

  document.querySelectorAll('.materialboxed').forEach((elem) => {
    // Initialize materialbox
    M.Materialbox.init(elem);
  });
});
