import app from "./app";

const port = "8080";

const server = app.listen(port, () => {
  console.log("Server running on port: " + port);
});

export default server;
