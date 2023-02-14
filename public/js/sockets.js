const socket = io.connect();

export const saveBookInfo = (bookInfo) => {
  localStorage.setItem("bookInfo", JSON.stringify(bookInfo));
};

export const loadBooks = (renderBooks) => {
  socket.on("server:loadBooks", renderBooks);
};

export const onNewBookInfo = (renderBookInfo) => {
  socket.on("server:bookInfo", renderBookInfo);
};

export const onNewBookPrices = (renderNewBookPrices) => {
  socket.on("server:newBookPrices", renderNewBookPrices);
};

export const onMessage = (editMessageLabel) => {
  socket.on("server:message", editMessageLabel);
};

export const onUserAuthSuccess = (renderUserBooks) => {
  socket.on("server:userAuthSuccess", renderUserBooks);
};

export const newUser = (user) => {
  socket.emit("client:newUser", user);
};

export const userAuth = (user) => {
  socket.emit("client:userAuth", user);
};

export const checkAuth = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);

  if (user) {
    socket.emit("client:checkAuth", user);
  }
};

export const sendBookURL = (bookUrl) => {
  socket.emit("client:bookUrl", bookUrl);
};

export const newBook = (e) => {
  let bookAddBtn = e.target;
  let bookCancelBtn = bookAddBtn.nextElementSibling;
  bookAddBtn.style.display = "none";
  bookCancelBtn.style.display = "none";

  let book = JSON.parse(localStorage.getItem("bookInfo"));
  socket.emit("client:newBook", book);

  localStorage.removeItem("bookInfo");
};

export const removeBook = (id) => {
  socket.emit("client:removeBook", { id: id });
};

export const updateBook = (e) => {
  let obj = e.target;

  obj.parentElement.previousElementSibling.classList.remove("hidden");
  obj.parentElement.classList.add("hidden");

  if (obj.innerText == "✓") {
    socket.emit("client:updateBook", {
      id: obj.dataset.id,
      tag: obj.previousElementSibling.value,
    });
  }
};

export const updateBookPrices = (books) => {
  let URLs = [];
  let IDs = [];

  books.forEach((book) => {
    URLs.push(book.querySelector(".book-title").href);
    IDs.push(book.dataset.id);
  });

  socket.emit("client:updateBookPrices", { URLs, IDs });
};
