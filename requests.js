exports.getMe = async function () {
  return axios.get("http://localhost:8080/users/me", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

exports.getItems = async function () {
  return axios.get("http://localhost:8080/items", {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};

exports.getItem = async function (id) {
  return axios.get("http://localhost:8080/items/" + id, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("jwtoken"),
    },
  });
};
