function logOut() {
  $.ajax({
    url: "/logout",
    method: "get",
    error: err => {
      console.log(err);
    },
    success: () => location.reload()
  });
}
