import {
  newBook,
  loadBooks,
  onMessage,
  onNewBookInfo,
  onUserAuthSuccess,
  checkAuth,
} from './sockets.js';
import { renderBooks, editMessageLabel, renderBookInfo, renderUserBooks } from './interface.js';

window.addEventListener('DOMContentLoaded', () => {
  loadBooks(renderBooks);
  onNewBookInfo(renderBookInfo);

  onUserAuthSuccess(renderUserBooks);
  checkAuth();

  onMessage(editMessageLabel);
});

// Save the Book on the screen
let bookAddBtn = document.querySelector('#book-add-btn');
bookAddBtn.addEventListener('click', newBook);
