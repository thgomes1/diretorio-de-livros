import Book from "./model/Book";
import User from "./model/User";
import { getBookInfo, getBookPrices } from "./services/getBook";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import localStorage from "localStorage";

export default (io) => {
  io.on("connection", function (socket) {
    console.log("Connection success", socket.id);

    const checkToken = async (info) => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Efetue login!");
        return;
      }
      const userVerified = jwt.verify(token, process.env.TOKEN_SECRET);

      if (info === "userID") {
        return userVerified.id;
      }

      if (info === "userName") {
        return userVerified.name;
      }
    };

    const loadBooks = async (userID) => {
      console.log(userID, "USERID");
      const books = await Book.find({
        userID: userID,
      });

      socket.emit("server:loadBooks", books);
    };

    const checkAuth = async (user) => {
      const userID = await checkToken("userID");
      console.log(user, userID, "REGISTRADOo");

      if (!userID) {
        console.log("Usuário não está autenticado");
      }
      if (userID) {
        socket.emit("server:userAuthSuccess", user);
        console.log("Usuário encontrado");

        loadBooks(userID);
      }
    };

    socket.on("client:bookUrl", async (URL) => {
      console.log(URL, "START - ONLY URL");

      if (URL.includes("https://www.amazon.com.br/")) {
        const bookInfo = await getBookInfo(URL);

        if (bookInfo.category !== "Livros") {
          socket.emit("server:message", {
            msg: "Este produto não é um livro ou se trata de um Kindle",
            type: "error",
          });
        }

        if (bookInfo.category == "Livros") {
          console.log(bookInfo, "END - ALL INFOS");
          socket.emit("server:bookInfo", bookInfo);
        }
      }
    });

    socket.on("client:newBook", async (data) => {
      const userID = await checkToken("userID");

      const selectedBook = await Book.findOne({
        title: data.title,
        userID: userID,
      });

      if (selectedBook) {
        socket.emit("server:message", {
          msg: "Este livro já foi inserido",
          type: "error",
        });
      }

      if (!selectedBook) {
        data.userID = userID;
        const newBook = new Book(data);

        try {
          await newBook.save();
          socket.emit("server:message", {
            msg: "O livro foi salvo",
            type: "saved",
          });
          loadBooks(await checkToken("userID"));
        } catch (error) {
          socket.emit("server:message", {
            msg: "Livro inválido",
            type: "error",
          });
        }
      }
    });

    socket.on("client:removeBook", async (data) => {
      await Book.findByIdAndDelete(data.id);

      loadBooks(await checkToken("userID"));
    });

    socket.on("client:updateBook", async (data) => {
      await Book.findByIdAndUpdate(data.id, { tag: data.tag });

      loadBooks(await checkToken("userID"));
    });

    socket.on("client:updateBookPrices", async (data) => {
      const IDs = data.IDs;
      const URLs = data.URLs;

      const newBookPrices = await getBookPrices(URLs);

      for (let i = 0; i < IDs.length; i++) {
        await Book.findByIdAndUpdate(IDs[i], { price: newBookPrices[i] });
      }

      loadBooks(await checkToken("userID"));
    });

    socket.on("client:newUser", async (data) => {
      const selectedUser = await User.findOne({
        user: data.user,
      });

      if (selectedUser) {
        socket.emit("server:message", {
          msg: "Este nome de usuário já está em uso!",
          type: "registerError",
        });
      }
      if (!selectedUser) {
        const newUser = new User({
          user: data.user,
          password: bcrypt.hashSync(data.password),
        });

        try {
          await newUser.save();
          socket.emit("server:message", {
            msg: "Usuário registrado com sucesso!",
            type: "registerError",
          });
        } catch (error) {
          socket.emit("server:message", {
            msg: "Erro ao criar usuário!",
            type: "registerError",
          });
        }
      }
    });

    socket.on("client:userAuth", async (data) => {
      if (!data.user || !data.password) {
        socket.emit("server:message", {
          msg: "Usuário/Senha em branco!",
          type: "loginError",
        });

        return;
      }

      const selectedUser = await User.findOne({
        user: data.user,
      });

      const passAndUserMatch = bcrypt.compareSync(
        data.password,
        selectedUser.password
      );

      if (!selectedUser || !passAndUserMatch) {
        socket.emit("server:message", {
          msg: "Usuário/Senha inválidos!",
          type: "loginError",
        });

        return;
      }

      if (selectedUser && passAndUserMatch) {
        const token = jwt.sign(
          {
            name: selectedUser.user,
            id: selectedUser.id,
          },
          process.env.TOKEN_SECRET
        );

        localStorage.setItem("token", token);
        socket.emit("server:userAuthSuccess", await checkToken("userName"));
        loadBooks(await checkToken("userID"));
      }
    });

    socket.on("client:checkAuth", async (user) => {
      checkAuth(user);
    });
  });
};
