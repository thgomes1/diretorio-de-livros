import {
  sendBookURL,
  userAuth,
  removeBook,
  updateBook,
  updateBookPrices,
  saveBookInfo,
  checkAuth,
  newUser,
} from "./sockets.js";

let login = ` 
<img src="./assets/auth-bg.jpg" alt="">

<form
  id="login-form"
  data-id="login"
  class="d-flex flex-wrap flex-column align-items-center justify-content-center mt-3"
  method="dialog"
>
  <h1>Bem-vindo novamente!</h1>
  <label>Faça o login para continuar</label>
  <input type="text" name="user" class="user" placeholder="Usuário" />
  <input type="password" name="password" class="password" placeholder="Senha" />
  <button id="login-btn" class="auth-btn btn">ENTRAR</button>
  <p id="auth-message-label" class="auth-label"></p>
  <p>Ainda não tem uma conta? <span id="show-register-btn" class="auth-toggle-btn">Registre-se</span></p>
</form>

`;
let register = `    
<img src="./assets/auth-bg.jpg" alt="">

<form
id="register-form"
data-id="register"
class="d-flex flex-wrap flex-column align-items-center justify-content-center mt-3"
method="dialog"
>
<h1>Seja bem-vindo!</h1>
<label>Faça o registro para começar</label>
<input type="text" name="user" class="user" placeholder="Usuário" />
<input type="password" name="password" class="password" placeholder="Senha" />
<button id="register-btn" class="auth-btn btn">REGISTRAR</button>
<p id="auth-message-label" class="auth-label"></p>
<p>Já tem uma conta? <span id="show-login-btn" class="auth-toggle-btn" >Logar-se</span></p>
</form>


`;

let footerContainer = document.getElementById("footer-container");
let logoutBtn = document.querySelector("#logout-btn");

let bookForm = document.forms["book-form"];
let booksContainer = document.querySelector("#books-container");
let bookUrlInput = document.querySelector("#book-url-input");

let loader = document.querySelector(".loader");

let messageLabel = document.querySelector("#message-label");

let bookAddBtn = document.querySelector("#book-add-btn");
let bookCancelBtn = document.querySelector("#book-cancel-btn");
let bookUpdatePricesBtn = document.querySelector("#book-update-prices");

let bookUpdateBtn,
  bookRemoveBtn,
  bookShowEditInputBtn = null;

let bookFormTitle = document.querySelector("#book-form-title");
let bookFormPrice = document.querySelector("#book-form-price");

let userName = document.querySelector("#username");

const sendBooksForUpdate = () => {
  let books = document.querySelectorAll(".book-box");
  updateBookPrices(books);
};

window.addEventListener("DOMContentLoaded", () => {
  toggleAuthContainers(login);
});

export const renderBooks = async (books) => {
  let allBooks = "";

  console.log(books);

  if (books.length == 0) {
    booksContainer.innerHTML = "";
  }

  if (books.length !== 0) {
    await books.forEach((book) => {
      console.log(book);
      allBooks += ` <div data-id="${book._id}" class="book-box d-flex w-75 mb-5 m-auto position-relative ">
                  <img class="book-img" src="${book.cover}" alt="CAPA DO LIVRO: ${book.title}" />
  
                  <div class="d-flex flex-column align-items-start justify-content-center book-text p-4">
                      <a href="${book.url}" class="book-title fw-bold fs-1 text-decoration-none">${book.title}</a>
                      <h1 class="book-price fs-4 position-absolute  bg-success">${book.price}</h1>
                      <h1 class="book-tag fs-4 fst-italic fw-light" >${book.tag}</h1>
  
                      <div class="book-tag-edit-container input-group hidden">
                          <input class="form-control fs-5" type="text" placeholder="Nova tag" name="tag" value="${book.tag}" />
                          <button class="btn btn-success fs-5 update" data-id="${book._id}" >✓</button>
                          <button class="btn btn-danger fs-5 update"  data-id="${book._id}" >X</button>
                      </div>
  
    
                  </div>
                  
                  <div class="book-buttons position-absolute" >
                      <li class="list-inline-item mt-2 ">
                          <button class="btn btn-success btn-sm rounded fs-4 showEditInput" type="button" data-toggle="tooltip" data-placement="top"><i class="fa fa-edit no-clickable"></i></button>
                      </li>
                      <li class="list-inline-item mt-2">
                          <button data-id="${book._id}" class="btn btn-danger btn-sm rounded fs-4 remove" type="button"  data-toggle="tooltip" data-placement="top"><i class="fa fa-trash "></i></button>
                      </li>
                  </div>
  
                  
  
              </div>`;

      booksContainer.innerHTML = allBooks;
    });
  }

  bookShowEditInputBtn = document.querySelectorAll(".showEditInput");
  bookUpdateBtn = document.querySelectorAll(".update");
  bookRemoveBtn = document.querySelectorAll(".remove");

  bookShowEditInputBtn.forEach((button) => {
    button.addEventListener("click", showEditInput);
  });

  bookUpdateBtn.forEach((button) => {
    button.addEventListener("click", updateBook);
  });

  bookRemoveBtn.forEach((button) => {
    button.addEventListener("click", () => removeBook(button.dataset.id));
  });
};

export const renderBookInfo = (book) => {
  bookForm["price"].value = book.price;
  bookForm["title"].value = book.title;
  bookForm["cover"].value = book.cover;
  bookForm["url"].value = book.url;
  bookForm["url"].readOnly = true;
  book.tag = "";

  messageLabel.innerText = "Livro carregado com sucesso!!";
  bookFormTitle.children[0].innerText = book.title;
  bookFormPrice.children[0].innerText = book.price;

  saveBookInfo(book);
};

export const editMessageLabel = (data) => {
  let authMessageLabel = document.querySelector("#auth-message-label");

  if (data.type === "registerError" || data.type === "loginError") {
    authMessageLabel.innerText = data.msg;
    authMessageLabel.style.opacity = "100%";
  }

  if (data.type === "saved" || data.type === "error") {
    messageLabel.innerText = data.msg;
    bookForm["url"].readOnly = false;
    resetForm();
  }
};

const showEditInput = function (event) {
  let obj = event.target;
  console.log(obj);
  obj.parentElement.parentElement.previousElementSibling.children[2].classList.add(
    "hidden"
  );
  obj.parentElement.parentElement.previousElementSibling.children[3].classList.remove(
    "hidden"
  );
};

const resetForm = (e) => {
  bookForm.reset();
  bookFormTitle.children[0].innerText = "";
  bookFormPrice.children[0].innerText = "";
  bookForm["url"].readOnly = false;

  if (e.target !== undefined) {
    bookAddBtn.style.display = "none";
    bookCancelBtn.style.display = "none";
    messageLabel.innerText =
      "( Formato do link deve ser: https://www.amazon.com.br/XXXXXXXXX )";
  }
};

const fadeOut = () => {
  let fadeEffect = setInterval(() => {
    if (!loader.style.opacity) {
      loader.style.opacity = 1;
    }
    if (loader.style.opacity > 0) {
      loader.style.opacity -= 0.1;
    } else {
      loader.style.display = "none";
      clearInterval(fadeEffect);
    }
  }, 50);
};

const checkSuccess = () => {
  let checkInterval = setInterval(() => {
    if (messageLabel.innerText == "Livro carregado com sucesso!!") {
      bookAddBtn.style.display = "block";
      bookAddBtn.style.opacity = 1;
      bookCancelBtn.style.display = "block";
      bookCancelBtn.style.opacity = 1;

      clearInterval(checkInterval);
    }
  }, 50);
};

bookUrlInput.onchange = function () {
  let bookUrl = bookUrlInput.value;
  console.log(bookUrl);

  if (!bookUrl.includes("https://www.amazon.com.br/")) {
    messageLabel.innerText = "Link inválido";

    resetForm();
  }

  if (bookUrl.includes("https://www.amazon.com.br/")) {
    loader.style.zIndex = 5;
    loader.style.opacity = 1;
    loader.style.display = "block";
    setTimeout(fadeOut, 2500);
    setTimeout(checkSuccess, 2500);

    sendBookURL(bookUrl);
  }
};

const registerNewUser = async () => {
  let userInput = document.querySelector("#register-form .user");
  let passwordInput = document.querySelector("#register-form .password");

  newUser({ user: userInput.value, password: passwordInput.value });
};

const authUser = () => {
  let userInput = document.querySelector("#login-form .user");
  let passwordInput = document.querySelector("#login-form .password");

  userAuth({ user: userInput.value, password: passwordInput.value });
};

const logoutUser = () => {
  localStorage.removeItem("user");

  document.body.classList.add("auth-active");
  toggleAuthContainers(login);
  checkAuth();
};

const toggleAuthContainers = (loginOrRegister) => {
  let authContainer = document.querySelector(`#auth-form-container`);

  if (!document.body.classList.contains("auth-active")) {
    authContainer.innerHTML = "";
    authContainer.style.opacity = 0;
    authContainer.style.zIndex = -1;
    return;
  }

  authContainer.innerHTML = loginOrRegister;
  authContainer.style.opacity = 1;
  authContainer.style.zIndex = 3;

  let authName = authContainer.querySelector("form").dataset.id;
  let authBtn = document.querySelector(".auth-btn");
  let authToggleBtn = document.querySelector(".auth-toggle-btn");

  if (authName == "login") {
    authBtn.addEventListener("click", authUser);
    authToggleBtn.addEventListener("click", () => {
      toggleAuthContainers(register);
    });
  }
  if (authName == "register") {
    authBtn.addEventListener("click", registerNewUser);
    authToggleBtn.addEventListener("click", () => {
      toggleAuthContainers(login);
    });
  }
};

const setUserName = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  userName.innerText = user;
};

export const renderUserBooks = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
  setUserName();

  document.body.classList.remove("auth-active");
  toggleAuthContainers();
};

logoutBtn.addEventListener("click", logoutUser);
bookCancelBtn.addEventListener("click", resetForm);
bookUpdatePricesBtn.addEventListener("click", sendBooksForUpdate);
