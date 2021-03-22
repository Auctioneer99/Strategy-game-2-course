function logIn() {
  $.ajax({
    url: "/login",
    method: "post",
    data: {
      email: $("#login [name=email]").val(),
      password: $("#login [name=password]").val()
    },
    error: err => {
      console.log(err);
    },
    success: () => location.reload()
  });
}

function register() {
  $.ajax({
    url: "/register",
    method: "post",
    data: {
      login: $("#register [name=login]").val(),
      email: $("#register [name=email]").val(),
      password1: $("#register [name=password1]").val(),
      password2: $("#register [name=password2]").val()
    },
    error: err => {
      console.log(err);
    },
    success: data => {
      if (data) console.log(data);
      else console.log("Успешно зареган");
    }
  });
}
